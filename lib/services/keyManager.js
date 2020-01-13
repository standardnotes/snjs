import { isNullOrUndefined } from '@Lib/utils';
import { SNItemsKey } from '@Models/keys/itemsKey';
import { SNRootKey } from '@Models/keys/rootKey';
import {
  ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED,
  intentRequiresEncryption
} from '@Protocol/intents';
import {
  CONTENT_TYPE_ROOT_KEY,
  CONTENT_TYPE_ITEMS_KEY,
  CONTENT_TYPE_ENCRYPTED_STORAGE
} from '@Models/content_types';
import {
  WRAPPED_ROOT_KEY,
  ROOT_KEY_WRAPPER_KEY_PARAMS,
  ROOT_KEY_PARAMS
} from '@Lib/storageKeys';
import { SYNC_EVENT_FULL_SYNC_COMPLETED } from '@Lib/services/sync/events';
import {
  STORAGE_VALUE_MODE_DEFAULT,
  STORAGE_VALUE_MODE_UNWRAPPED
} from '@Lib/services/storage_manager';

/** i.e No account and no passcode */
export const KEY_MODE_ROOT_KEY_NONE         = 0;
/** i.e Account but no passcode */
export const KEY_MODE_ROOT_KEY_ONLY         = 1;
/** i.e Account plus passcode */
export const KEY_MODE_ROOT_KEY_PLUS_WRAPPER = 2;
/** i.e No account, but passcode */
export const KEY_MODE_WRAPPER_ONLY          = 3;

export class SNKeyManager {
  constructor({modelManager, storageManager, protocolManager}) {
    if(!modelManager || !storageManager || !protocolManager) {
      throw 'Invalid KeyManager construction';
    }
    this.keyMode = KEY_MODE_ROOT_KEY_NONE;
    this.protocolManager = protocolManager;
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.keyObservers = [];

    this.modelManager.addMappingObserver(
      'key-manager',
      [CONTENT_TYPE_ITEMS_KEY],
      (allItems) => {
        this.notifyKeyObserversOfKeyChange(CONTENT_TYPE_ITEMS_KEY);
      }
    )

    /** Hide rootKey enumeration */
    Object.defineProperty(this, 'rootKey', {
      enumerable: false,
      writable: true
    })

    this.setLocalDatabaseEncryptionPolicy({encrypted: true});
  }

  async initialize() {
    const wrappingKeyParams = await this.getRootKeyWrapperKeyParams();
    const wrappedRootKey = await this.getWrappedRootKeyFromStorage();
    const hasWrapper = !isNullOrUndefined(wrappingKeyParams);
    const hasRootKey = !isNullOrUndefined(wrappedRootKey);
    if(hasWrapper && hasRootKey) {
      this.keyMode = KEY_MODE_ROOT_KEY_PLUS_WRAPPER;
    } else if(hasWrapper && !hasRootKey) {
      this.keyMode = KEY_MODE_WRAPPER_ONLY;
    } else if(!hasWrapper && hasRootKey){
      this.keyMode = KEY_MODE_ROOT_KEY_ONLY;
    } else if(!hasWrapper && !hasRootKey) {
      this.keyMode = KEY_MODE_ROOT_KEY_NONE;
    } else {
      throw 'Invalid key mode condition';
    }

    if(this.keyMode === KEY_MODE_ROOT_KEY_ONLY) {
      this.rootKey = await this.getRootKeyFromKeychain();
      this.notifyKeyObserversOfKeyChange(CONTENT_TYPE_ROOT_KEY);
    }
  }

  /**
   * When a root key is available, or an item key is created or downloaded,
   * observers can listen and act accordingly.  For example, to decrypt items that were waiting on a key.
   * @param name  A unique identifier for this observer
   * @param callback  A function that takes in a content type to call back when keys have changed.
   */
  addKeyChangeObserver({name, callback}) {
    this.keyObservers.push({name, callback});
  }

  notifyKeyObserversOfKeyChange(contentType) {
    for(const observer of this.keyObservers) {
      observer.callback(contentType);
    }
  }

  /**
   * @returns All SN|ItemsKey objects synced to the account.
   */
  get allItemsKeys() {
    return this.modelManager.itemsKeys;
  }

  /**
   * Dynamically set an SNKeychainDelegate object
   */
  setKeychainDelegate(delegate) {
    this.keychainDelegate = delegate;
  }

  /** @private */
  async getRootKeyFromKeychain() {
    const rawKey = await this.keychainDelegate.getKeyChainValue();
    if(isNullOrUndefined(rawKey)) {
      return null;
    }
    return new SNRootKey.FromRaw(rawKey);
  }

  /** @private */
  async saveRootKeyToKeychain() {
    if(isNullOrUndefined(this.rootKey)) {
      throw 'Attempting to non-existent root key to the keychain.';
    }
    if(this.keyMode !== KEY_MODE_ROOT_KEY_ONLY) {
      throw 'Should not be persisting wrapped key to keychain.'
    }
    const rawKey = this.rootKey.rootValues();
    await this.keychainDelegate.setKeyChainValue(rawKey);
  }

  /**
   * @public
   * @returns  Key params object containing root key wrapper key params
  */
  async getRootKeyWrapperKeyParams() {
    const rawKeyParams = await this.storageManager.getValue(
      ROOT_KEY_WRAPPER_KEY_PARAMS,
      STORAGE_VALUE_MODE_UNWRAPPED
    );
    if(!rawKeyParams) {
      return null;
    }
    return this.protocolManager.createVersionedKeyParams(rawKeyParams);
  }

  /**
   * @private
   * @returns  Plain object containing persisted wrapped (encrypted) root key
  */
  async getWrappedRootKeyFromStorage() {
    return this.storageManager.getValue(
      WRAPPED_ROOT_KEY,
      STORAGE_VALUE_MODE_UNWRAPPED
    );
  }

  /**
   * @public
   * @returns  The keyParams saved to disk for root key.
   */
  async getRootKeyParams() {
    if(this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      return this.getRootKeyWrapperKeyParams();
    } else if((
      this.keyMode === KEY_MODE_ROOT_KEY_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      return this.storageManager.getValue(
        ROOT_KEY_PARAMS,
        STORAGE_VALUE_MODE_DEFAULT
      );
    } else {
      throw 'Unhandled key mode';
    }
  }

  /**
   * @public
   * We know a wrappingKey is correct if it correctly decrypts
   * wrapped root key.
   */
  async validateWrappingKey(wrappingKey) {
    const wrappedRootKey = await this.getWrappedRootKeyFromStorage();
    /** If wrapper only, storage is encrypted directly with wrappingKey */
    if(this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      return this.storageManager.canDecryptWithKey(wrappingKey);
    } else if((
      this.keyMode === KEY_MODE_ROOT_KEY_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      /**
      * In these modes, storage is encrypted with account keys, and
      * account keys are encrypted with wrappingKey. Here we validate
      * by attempting to decrypt account keys.
      */
      const payload = CreateMaxPayloadFromAnyObject({object: wrappedRootKey});
      const decrypted = await this.protocolManager.payloadByDecryptingPayload({
        payload: payload,
        key: wrappingKey
      });
      return !decrypted.errorDecrypting;
    } else {
      throw 'Unhandled case in validateWrappingKey';
    }
  }

  /**
   * @public
   * Application interfaces must check to see if the root key requires unwrapping on load.
   * If so, they must generate the unwrapping key by getting our saved wrapping key keyParams.
   * After unwrapping, the root key is automatically loaded.
  */
  async unwrapRootKey({wrappingKey}) {
    if(this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      this.rootKey = wrappingKey;
      return;
    }
    if(this.keyMode !== KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      throw 'Invalid key mode condition for unwrapping.'
    }
    const wrappedKey = await this.getWrappedRootKeyFromStorage();
    const payload = CreateMaxPayloadFromAnyObject({object: wrappedKey});
    const decrypted = await this.protocolManager.payloadByDecryptingPayload({
      payload: payload,
      key: wrappingKey
    });
    if(decrypted.errorDecrypting) {
      throw 'Unable to decrypt root key with provided wrapping key.';
    } else {
      this.rootKey = new SNRootKey(decrypted);
    }
  }

  /**
   * @public
   * Encrypts rootKey and saves it in storage instead of keychain, and then clears keychain.
   * This is because we don't want to store large encrypted payloads in the keychain.
   * If the root key is not wrapped, it is stored in plain form in the user's secure keychain.
  */
  async setRootKeyWrapper({wrappingKey, keyParams}) {
    if(this.keyMode === KEY_MODE_ROOT_KEY_NONE) {
      this.keyMode = KEY_MODE_WRAPPER_ONLY;
    } else if(this.keyMode === KEY_MODE_ROOT_KEY_ONLY) {
      this.keyMode = KEY_MODE_ROOT_KEY_PLUS_WRAPPER;
    } else {
      throw 'Attempting to set wrapper on already wrapped key.'
    }

    await this.keychainDelegate.clearKeyChainValue();

    if((
      this.keyMode === KEY_MODE_WRAPPER_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      if(this.keyMode === KEY_MODE_WRAPPER_ONLY) {
        this.rootKey = wrappingKey;
      } else {
        await this.persistWrappedRootKey({
          wrappingKey: wrappingKey
        });
      }

      await this.storageManager.setValue(
        ROOT_KEY_WRAPPER_KEY_PARAMS,
        keyParams,
        STORAGE_VALUE_MODE_UNWRAPPED
      );

      return;
    }

    throw 'Invalid keyMode on setRootKeyWrapper'
  }

  /** @private */
  async persistWrappedRootKey({wrappingKey}) {
    const payload = CreateMaxPayloadFromAnyObject({
      object: this.rootKey
    });
    const wrappedKey = await this.protocolManager.payloadByEncryptingPayload({
      payload: payload,
      key: wrappingKey,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED
    })
    await this.storageManager.setValue(
      WRAPPED_ROOT_KEY,
      wrappedKey,
      STORAGE_VALUE_MODE_UNWRAPPED
    );
  }

  /**
   * @public
   * Removes root key wrapper from local storage and stores root keys bare in secure keychain.
   */
  async removeRootKeyWrapper() {
    if((
      this.keyMode !== KEY_MODE_WRAPPER_ONLY &&
      this.keyMode !== KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      throw 'Attempting to remove root key wrapper on unwrapped key.'
    }

    if(this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      this.keyMode = KEY_MODE_ROOT_KEY_NONE;
      this.rootKey = null;
    } else if(this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      this.keyMode = KEY_MODE_ROOT_KEY_ONLY;
    }

    await this.storageManager.removeValue(
      WRAPPED_ROOT_KEY,
      STORAGE_VALUE_MODE_UNWRAPPED
    );
    await this.storageManager.removeValue(
      ROOT_KEY_WRAPPER_KEY_PARAMS,
      STORAGE_VALUE_MODE_UNWRAPPED
    );

    if(this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      await this.saveRootKeyToKeychain();
    }
  }

  /**
   * @public
   * The root key is distinct from regular keys and are only saved locally in the keychain,
   * in non-item form. Applications set root key on sign in, register, or password change.
   * @param key  A SNRootKey object.
   */
  async setRootKey({key, keyParams}) {
    if(key.content_type !== CONTENT_TYPE_ROOT_KEY) {
      throw `Root key must be a ${CONTENT_TYPE_ROOT_KEY} object.`;
    }
    if(!keyParams) {
      throw 'keyParams must be supplied if setting root key.';
    }

    if(this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      this.keyMode = KEY_MODE_ROOT_KEY_PLUS_WRAPPER;
    } else if(this.keyMode === KEY_MODE_ROOT_KEY_NONE) {
      this.keyMode = KEY_MODE_ROOT_KEY_ONLY;
    } else if((
      this.keyMode === KEY_MODE_ROOT_KEY_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      /** Root key is simply changing, mode stays the same */
      this.keyMode = this.keyMode;
    } else {
      throw 'Unhandled key mode';
    }

    const previousRootKey = this.rootKey;
    this.rootKey = key;

    await this.storageManager.setValue(
      ROOT_KEY_PARAMS,
      keyParams,
      STORAGE_VALUE_MODE_DEFAULT
    );
    if(this.keyMode === KEY_MODE_ROOT_KEY_ONLY) {
      await this.saveRootKeyToKeychain();
    } else if(this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      await this.persistWrappedRootKey({wrappingKey: previousRootKey});
    }
    this.notifyKeyObserversOfKeyChange(CONTENT_TYPE_ROOT_KEY);
  }

  /**
   * @public
   * @returns  SNRootKey object
   */
  async getRootKey() {
    return this.rootKey;
  }

  /**
   * @public
   * Deletes root key and wrapper from keychain. Used when signing out of application.
   */
  async clearLocalKeyState() {
    await this.keychainDelegate.clearKeyChainValue();
    await this.storageManager.removeValue(
      WRAPPED_ROOT_KEY,
      STORAGE_VALUE_MODE_UNWRAPPED
    );
    await this.storageManager.removeValue(
      ROOT_KEY_WRAPPER_KEY_PARAMS,
      STORAGE_VALUE_MODE_UNWRAPPED
    );
    await this.storageManager.removeValue(
      ROOT_KEY_PARAMS,
      STORAGE_VALUE_MODE_DEFAULT
    );
    this.keyMode = KEY_MODE_ROOT_KEY_NONE;
  }

  /**
   * @param {string}: The password string to generate a root key from.
   * @returns {boolean}: Whether the input password generates root keys equal to the ones saved.
   */
  async validateAccountPassword(password) {
    const keyParams = await this.getRootKeyParams();
    const key = await this.protocolManager.computeRootKey({password, keyParams});
    const success = await this.protocolManager.compareKeys(key, this.rootKey);
    return success;
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption, and adds it to model management.
   * Consumer must call sync.
   */
  async createNewItemsKey() {
    const itemsKey = await this.protocolManager.defaultOperator().createItemsKey();
    const currentDefault = await this.getDefaultItemsKey();
    if(currentDefault) {
      currentDefault.content.isDefault = false;
      await this.modelManager.setItemDirty(currentDefault);
    }
    itemsKey.content.isDefault = true;
    const payload = itemsKey.payloadRepresentation({
      override: {
        dirty: true
      }
    })
    await this.modelManager.mapPayloadsToLocalItems({
      payloads: [payload]
    })
    return itemsKey;
  }

  /**
   * @returns The SNItemsKey object to use to encrypt new or updated items.
   */
  async getDefaultItemsKey() {
    return this.allItemsKeys.find((key) => {return key.isDefault === true});
  }

  /**
   * When migrating from non-SNItemsKey architecture, many items will not have a relationship with any key object.
   * For those items, we can be sure that only 1 key object will correspond to that protocol version.
   * @returns The SNItemsKey object to decrypt items encrypted with previous protocol version.
   */
  async defaultItemsKeyForProtocolVersion(version) {
    return this.allItemsKeys.find((key) => {return key.version === version});
  }

  /**
   * @param uuid  The uuid of the SNItemsKey object to return
  */
  async getItemsKeyForId(uuid) {
    return this.modelManager.findItem(uuid);
  }

  /**
   * Only two types of items should be encrypted with a root key:
   * - An SNItemsKey object
   * - An encrypted storage object (local)
   */
  contentTypeUsesRootKeyEncryption(contentType) {
    return (
      contentType === CONTENT_TYPE_ITEMS_KEY ||
      contentType === CONTENT_TYPE_ENCRYPTED_STORAGE
    )
  }

  /**
   * @returns  The SNItemsKey object to use for encrypting this item.
               For regular items, should be equal too this.getDefaultItemsKey.
               For SNItemsKey items, should be equal to root keys.
  */
  async keyToUseForEncryptionOfPayload({payload, intent}) {
    if(isNullOrUndefined(intent)) {
      throw 'Intent must be supplied when looking up key for encryption of item.';
    }
    if(this.contentTypeUsesRootKeyEncryption(payload.content_type)) {
      const rootKey = await this.getRootKey();
      if(!rootKey) {
        if(intentRequiresEncryption(intent)) {
          throw 'Root key encryption is required but no root key is available.';
        } else  {
          return null;
        }
      }
      return rootKey;
    } else {
      if(this.localDatabaseEncryptionDisabled && isLocalStorageIntent(intent)) {
        return null;
      }
      return this.getDefaultItemsKey();
    }
  }

  itemsKeyForPayload(payload) {
    return this.allItemsKeys.find((key) => key.uuid === payload.items_key_id);
  }

  /**
   * Payloads could have been previously encrypted with any arbitrary SNItemsKey object.
   * If the payload is a key object, it is always encrypted with the root key, and so return that.
   * Otherwise, we check to see if the payload has a relationship with any given key.
   * If it doesn't, this means the payload was encrypted with legacy behavior. We return then
   * the key object corresponding to the protocol version of this payload.
   * @returns  The SNItemsKey object to use for decrypting this payload.
  */
  async keyToUseForDecryptionOfPayload({payload}) {
    if(this.contentTypeUsesRootKeyEncryption(payload.content_type)) {
      return this.getRootKey();
    }

    if(payload.items_key_id) {
      const itemsKey = this.itemsKeyForPayload(payload);
      return itemsKey;
    }

    const payloadProtocolVersion = this.protocolManager.versionForPayload(payload);
    if(payloadProtocolVersion === this.protocolManager.latestVersion()) {
      throw 'No associated key found for item encrypted with latest protocol version.';
    }

    return this.defaultItemsKeyForProtocolVersion(payloadProtocolVersion);
  }

  /**
   * Allows interfaces to disable local database encryption for performance reasons (mobile).
   */
  async setLocalDatabaseEncryptionPolicy({encrypted}) {
    this.localDatabaseEncryptionDisabled = !encrypted;
  }

}

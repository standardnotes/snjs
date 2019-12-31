import { SNItemsKey } from '@Models/keys/itemsKey';
import { SNRootKey } from '@Models/keys/rootKey';
import { ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED, intentRequiresEncryption } from '@Protocol/intents';
import { isNullOrUndefined } from '@Lib/utils';
import uniq from 'lodash/uniq';

import {
  SN_ROOT_KEY_CONTENT_TYPE,
  SN_ITEMS_KEY_CONTENT_TYPE,
  ENCRYPTED_STORAGE_CONTENT_TYPE
} from '@Lib/constants';

import {
  WRAPPED_ROOT_KEY,
  WRAPPED_ROOT_KEY_PARAMS,
  ROOT_KEY_PARAMS
} from '@Protocol/storageKeys';


export class SNKeyManager {
  constructor({modelManager, storageManager, protocolManager}) {
    if(!modelManager || !storageManager || !protocolManager) {
      throw 'Invalid KeyManager construction';
    }
    this.protocolManager = protocolManager;
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.itemsKeyObservers = [];

    this.modelManager.addItemSyncObserver(
      'key-manager',
      [SN_ITEMS_KEY_CONTENT_TYPE],
      (allItems) => {
        this.notifyItemsKeyObserversOfItemsKeys(this.allItemsKeys);
      }
    )

    // Hide rootKey enumeration
    Object.defineProperty(this, 'rootKey', {
      enumerable: false,
      writable: true
    })

    this.setLocalDatabaseEncryptionPolicy({encrypted: true});
  }

  /**
   * When an item key is created or downloaded, observers can listen and act accordingly.
   * For example, to decrypt items that were waiting on a key.
   * @param name  A unique identifier for this observer
   * @param callback  A function to call back when item keys have changed. The function should
   *                  take one parameter: an array of item keys.
   */
  addItemsKeyChangeObserver({name, callback}) {
    this.itemsKeyObservers.push({name, callback});
  }

  notifyItemsKeyObserversOfItemsKeys(itemsKeys) {
    for(const observer of this.itemsKeyObservers) {
      observer.callback(itemsKeys);
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

  async loadRootKeyFromKeychain() {
    const rawKey = await this.keychainDelegate.getKeyChainValue();
    if(rawKey === null) {
      throw 'Attempting to load non-existent root key from keychain.';
    }
    return new SNRootKey.FromRaw(rawKey);
  }

  async saveRootKeyToKeychain() {
    if(this.rootKey === null) {
      throw 'Attempting to non-existent root key to the keychain.';
    }
    const rawKey = this.rootKey.rootValues();
    await this.keychainDelegate.setKeyChainValue(rawKey);
  }

  /**
   * @returns  Plain object containing persisted wrapped (encrypted) root key
  */
  async getWrappedKeyFromStorage() {
    return this.storage.getValue(WRAPPED_ROOT_KEY);
  }

  /**
   * The root key requires unwrapping if a wrapper key exists in storage.
  */
  async rootKeyRequiresUnwrapping() {
    const wrappedKey = await this.getWrappedKeyFromStorage();
    return wrappedKey !== null;
  }

  /**
   * Application interfaces must check to see if the root key requires unwrapping on load.
   * If so, they must generate the unwrapping key by getting our saved wrapping key keyParams.
   * After unwrapping, the root key is automatically loaded.
  */
  async unwrapRootKey({wrappingKey}) {
    const wrappedKey = await this.getWrappedKeyFromStorage();
    const payload = CreatePayloadFromAnyObject({object: wrappedKey});
    await this.protocolManager.payloadByDecryptingPayload({payload: payload, key: wrappingKey});
    this.rootKey = new SNRootKey(wrappedKey);
  }

  /**
   * Interfaces should only call this method if they have checked that the key does not require unwrapping.
   */
  async loadRootKey() {
    if(await this.rootKeyRequiresUnwrapping()) {
      throw 'Attempting to load root key without first unwrapping.';
    }

    if(this.rootKey !== null) {
      return;
    }

    this.rootKey = await this.loadRootKeyFromKeychain();
  }

  /**
   * Encrypts rootKey and saves it in storage instead of keychain, and then clears keychain.
   * This is because we don't want to store large encrypted payloads in the keychain.
   * If the root key is not wrapped, it is stored in plain form in the user's secure keychain.
  */
  async setRootKeyWrapper({wrappingKey, keyParams}) {
    if(this.rootKey === null) {
      throw 'Attempting to set a root key wrapper on an unloaded root key.'
    }
    await this.storageManager.setValue(WRAPPED_ROOT_KEY_PARAMS, keyParams);
    const payload = CreatePayloadFromAnyObject({object: this.rootKey});
    const wrappedKey = await this.protocolManager.payloadByEncryptingPayload({
      payload: payload,
      key: wrappingKey,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED
    })
    await this.storageManager.setValue(WRAPPED_ROOT_KEY, wrappedKey);
    await this.keychainDelegate.clearKeyChainValue();
  }

  /**
   * Removes root key wrapper from local storage and stores root keys bare in secure keychain.
   */
  async removeRootKeyWrapper() {
    if(this.rootKey === null) {
      throw 'Attempting to remove root key wrapper on an unloaded root key.'
    }

    if(await this.rootKeyRequiresUnwrapping() === false) {
      throw 'Attempting to unwrap already unwrapped key.';
    }

    await this.storageManager.removeValue(WRAPPED_ROOT_KEY);
    await this.storageManager.removeValue(WRAPPED_ROOT_KEY_PARAMS);

    await this.saveRootKeyToKeychain();
  }

  /**
   * The root key is distinct from regular keys and are only saved locally in the keychain,
   * in non-item form.
   * @param key  A SNRootKey object.
   */
  async setRootKey({key, keyParams}) {
    if(key.content_type !== SN_ROOT_KEY_CONTENT_TYPE) {
      throw `Root key must be a ${SN_ROOT_KEY_CONTENT_TYPE} object.`;
    }

    if(!keyParams) {
      throw 'keyParams must be supplied if setting root key.';
    }

    this.rootKey = key;

    await this.storageManager.setValue(ROOT_KEY_PARAMS, keyParams);
    await this.saveRootKeyToKeychain();
  }

  /**
   * Checks to see if a root key is available.
   */
  hasRootKey() {
    return !isNullOrUndefined(this.rootKey);
  }

  /**
   * @returns  SNRootKey object
   */
  async getRootKey() {
    if(!this.rootKey) {
      throw 'Attempting to access non-existing root key';
    }
    return this.rootKey;
  }

  /**
   * Deletes root key and wrapper from keychain. Used when signing out of application.
   */
  async deleteRootKey() {
    await this.keychainDelegate.clearKeyChainValue();
    await this.storageManager.removeValue(WRAPPED_ROOT_KEY);
    await this.storageManager.removeValue(WRAPPED_ROOT_KEY_PARAMS);
    await this.storageManager.removeValue(ROOT_KEY_PARAMS);
  }

  /**
   * @returns  The keyParams saved to disk for root key.
   */
  async getRootKeyParams() {
    return this.storageManager.getValue(ROOT_KEY_PARAMS);
  }

  /**
   * @param {string}: The password string to generate a root key from.
   * @returns {boolean}: Whether the input password generates root keys equal to the ones saved.
   */
  async verifyAccountPassword(password) {
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
      this.modelManager.setItemDirty(currentDefault);
    }
    itemsKey.content.isDefault = true;
    this.modelManager.addItem(itemsKey);
    this.modelManager.setItemDirty(itemsKey, true);
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
      contentType === SN_ITEMS_KEY_CONTENT_TYPE ||
      contentType === ENCRYPTED_STORAGE_CONTENT_TYPE
    )
  }

  /**
   * @returns  The SNItemsKey object to use for encrypting this item.
               For regular items, should be equal too this.getDefaultItemsKey.
               For SNItemsKey items, should be equal to root keys.
  */
  async keyToUseForEncryptionOfPayload({payload, intent}) {
    if(intent === null || intent === undefined) {
      throw 'Intent must be supplied when looking up key for encryption of item.';
    }
    if(this.contentTypeUsesRootKeyEncryption(payload.content_type)) {
      const hasRootKey = await this.hasRootKey();
      if(!hasRootKey) {
        if(intentRequiresEncryption(intent)) {
          throw 'Root key encryption is required but no root key is available.';
        } else  {
          return null;
        }
      }
      return this.getRootKey();
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

import { PureService } from '@Lib/services/pure_service';
import { isNullOrUndefined, removeFromArray } from '@Lib/utils';
import { CreateMaxPayloadFromAnyObject } from '@Payloads';
import { ContentTypes } from '@Models/content_types';
import { StorageKeys } from '@Lib/storage_keys';
import { SNRootKey, EncryptionIntents, intentRequiresEncryption } from '@Protocol';
import { StorageValueModes } from '@Lib/services/storage_service';

/** i.e No account and no passcode */
export const KEY_MODE_ROOT_KEY_NONE = 0;
/** i.e Account but no passcode */
export const KEY_MODE_ROOT_KEY_ONLY = 1;
/** i.e Account plus passcode */
export const KEY_MODE_ROOT_KEY_PLUS_WRAPPER = 2;
/** i.e No account, but passcode */
export const KEY_MODE_WRAPPER_ONLY = 3;

/** 
 * The key manager is responsible for managing root key and root key wrapper states.
 * When the key manager is initialized, it initiates itself with a keyMode, which 
 * dictates the entire flow of key management. The key manager's responsibilities include:
 * - interacting with the device keychain to save or clear the root key
 * - interacting with storage to save root key params or wrapper params, or the wrapped root key.
 * - exposing methods that allow the application to unwrap the root key (unlock the application)
 * 
 * It also exposes two primary methods for determing what key should be used to encrypt
 * or decrypt a particular payload. Some payloads are encrypted directly with the rootKey
 * (such as itemsKeys and encryptedStorage). Others are encrypted with itemsKeys (notes, tags, etc).
 */
export class SNKeyManager extends PureService {
  constructor({ modelManager, storageService, protocolService, itemsKeyManager, deviceInterface }) {
    if (!modelManager || !storageService || !protocolService || !itemsKeyManager || !deviceInterface) {
      throw 'Invalid KeyManager construction';
    }
    super();
    this.keyMode = KEY_MODE_ROOT_KEY_NONE;
    this.modelManager = modelManager;
    this.protocolService = protocolService;
    this.storageService = storageService;
    this.itemsKeyManager = itemsKeyManager;
    this.deviceInterface = deviceInterface;
    this.keyObservers = [];

    /** Hide rootKey enumeration */
    Object.defineProperty(this, 'rootKey', {
      enumerable: false,
      writable: true
    });
  }

  /** @override */
  deinit() {
    this.modelManager = null;
    this.protocolService = null;
    this.storageService = null;
    this.itemsKeyManager = null;
    this.deviceInterface = null;
    this.keyObservers.length = 0;
    this.rootKey = null;
    super.deinit();
  }

  /** @access public */
  async initialize() {
    const wrappedRootKey = await this.getWrappedRootKey();
    const accountKeyParams = await this.getAccountKeyParams();
    const hasWrapper = await this.hasRootKeyWrapper();
    const hasRootKey =
      !isNullOrUndefined(wrappedRootKey) ||
      !isNullOrUndefined(accountKeyParams);
    if (hasWrapper && hasRootKey) {
      this.keyMode = KEY_MODE_ROOT_KEY_PLUS_WRAPPER;
    } else if (hasWrapper && !hasRootKey) {
      this.keyMode = KEY_MODE_WRAPPER_ONLY;
    } else if (!hasWrapper && hasRootKey) {
      this.keyMode = KEY_MODE_ROOT_KEY_ONLY;
    } else if (!hasWrapper && !hasRootKey) {
      this.keyMode = KEY_MODE_ROOT_KEY_NONE;
    } else {
      throw 'Invalid key mode condition';
    }

    if (this.keyMode === KEY_MODE_ROOT_KEY_ONLY) {
      this.rootKey = await this.getRootKeyFromKeychain();
      await this.notifyObserversOfChange();
    }
  }

  /**
   * Register a callback to be notified when root key status changes.
   * @access public
   * @param callback  A function that takes in a content type to call back when root
   *                  key or wrapper status has changed.
   */
  onStatusChange(callback) {
    this.keyObservers.push(callback);
    return () => {
      removeFromArray(this.keyObservers, callback);
    };
  }

  /** @access private */
  async notifyObserversOfChange() {
    for (const observer of this.keyObservers) {
      await observer();
    }
  }

  /** @access private */
  async getRootKeyFromKeychain() {
    const rawKey = await this.deviceInterface.getKeychainValue();
    if (isNullOrUndefined(rawKey)) {
      return null;
    }
    const rootKey = await SNRootKey.Create({
      content: rawKey
    });
    return rootKey;
  }

  /** @access private */
  async saveRootKeyToKeychain() {
    if (isNullOrUndefined(this.rootKey)) {
      throw 'Attempting to non-existent root key to the keychain.';
    }
    if (this.keyMode !== KEY_MODE_ROOT_KEY_ONLY) {
      throw 'Should not be persisting wrapped key to keychain.';
    }
    const rawKey = this.rootKey.getPersistableValue();
    await this.deviceInterface.setKeychainValue(rawKey);
  }

  /**
   * @access public
   * @returns {Promise<boolean>} True if a root key wrapper (passcode) is configured.
   */
  async hasRootKeyWrapper() {
    const wrapper = await this.getRootKeyWrapperKeyParams();
    return !isNullOrUndefined(wrapper);
  }

  /**
   * @access public
   * A non-async alternative to `hasRootKeyWrapper` which uses pre-loaded state
   * to determine if a passcode is configured.
   * @returns {boolean}
   */
  hasPasscode() {
    return (
      this.keyMode === KEY_MODE_WRAPPER_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    );
  }

  /**
   * @access public
   * @returns {Promise<boolean>} True if the root key has not yet been unwrapped (passcode locked).
   */
  async rootKeyNeedsUnwrapping() {
    return await this.hasRootKeyWrapper() && isNullOrUndefined(this.rootKey);
  }

  /**
   * @access public
   * @returns {Promise<SNRootKeyParams>} Key params object containing root key wrapper key params
   */
  async getRootKeyWrapperKeyParams() {
    const rawKeyParams = await this.storageService.getValue(
      StorageKeys.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped
    );
    if (!rawKeyParams) {
      return null;
    }
    return this.protocolService.createKeyParams(rawKeyParams);
  }

  /**
   * @access private
   * @returns {Promise<object>} Object containing persisted wrapped (encrypted) root key
   */
  async getWrappedRootKey() {
    return this.storageService.getValue(
      StorageKeys.WrappedRootKey,
      StorageValueModes.Nonwrapped
    );
  }

  /**
   * Returns rootKeyParams by reading from storage.
   * @access public
   * @returns {Promise<SNRootKeyParams>}
   */
  async getRootKeyParams() {
    if (this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      return this.getRootKeyWrapperKeyParams();
    } else if ((
      this.keyMode === KEY_MODE_ROOT_KEY_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      return this.getAccountKeyParams();
    } else {
      throw `Unhandled key mode for getRootKeyParams ${this.keyMode}`;
    }
  }

  /**
   * @access public
   * @returns {SNRootKeyParams} getRootKeyParams may return different params based on different
   *           keyMode. This function however strictly returns only account params.
   */
  async getAccountKeyParams() {
    const rawKeyParams = await this.storageService.getValue(
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    if (!rawKeyParams) {
      return null;
    }
    return this.protocolService.createKeyParams(rawKeyParams);
  }

  /**
   * We know a wrappingKey is correct if it correctly decrypts
   * wrapped root key.
   * @access public
   * @returns {Promise<boolean>}
   */
  async validateWrappingKey(wrappingKey) {
    const wrappedRootKey = await this.getWrappedRootKey();
    /** If wrapper only, storage is encrypted directly with wrappingKey */
    if (this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      return this.storageService.canDecryptWithKey(wrappingKey);
    } else if ((
      this.keyMode === KEY_MODE_ROOT_KEY_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      /**
      * In these modes, storage is encrypted with account keys, and
      * account keys are encrypted with wrappingKey. Here we validate
      * by attempting to decrypt account keys.
      */
      const wrappedKeyPayload = CreateMaxPayloadFromAnyObject({
        object: wrappedRootKey
      });
      const decrypted = await this.protocolService.payloadByDecryptingPayload({
        payload: wrappedKeyPayload,
        key: wrappingKey
      });
      return !decrypted.errorDecrypting;
    } else {
      throw 'Unhandled case in validateWrappingKey';
    }
  }

  /**
   * Computes the root key wrapping key given a passcode.
   * Wrapping key params are read from disk.
   * @access public
   * @returns {SNRootKey}
   */
  async computeWrappingKey({ passcode }) {
    const keyParams = await this.getRootKeyWrapperKeyParams();
    const key = await this.protocolService.computeRootKey({
      password: passcode,
      keyParams: keyParams
    });
    return key;
  }

  /**
   * @access public
   * Unwraps the persisted root key value using the supplied wrappingKey.
   * Application interfaces must check to see if the root key requires unwrapping on load.
   * If so, they must generate the unwrapping key by getting our saved wrapping key keyParams.
   * After unwrapping, the root key is automatically loaded.
   * @returns {void}
   */
  async unwrapRootKey({ wrappingKey }) {
    if (this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      this.rootKey = wrappingKey;
      return;
    }
    if (this.keyMode !== KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      throw 'Invalid key mode condition for unwrapping.';
    }
    const wrappedKey = await this.getWrappedRootKey();
    const payload = CreateMaxPayloadFromAnyObject({ object: wrappedKey });
    const decrypted = await this.protocolService.payloadByDecryptingPayload({
      payload: payload,
      key: wrappingKey
    });
    if (decrypted.errorDecrypting) {
      throw Error('Unable to decrypt root key with provided wrapping key.');
    } else {
      this.rootKey = await SNRootKey.Create({
        uuid: decrypted.uuid,
        content: decrypted.content
      });
      await this.notifyObserversOfChange();
    }
  }

  /**
   * @access public
   * Encrypts rootKey and saves it in storage instead of keychain, and then
   * clears keychain. This is because we don't want to store large encrypted
   * payloads in the keychain. If the root key is not wrapped, it is stored
   * in plain form in the user's secure keychain.
  */
  async setNewRootKeyWrapper({ wrappingKey, keyParams }) {
    if (this.keyMode === KEY_MODE_ROOT_KEY_NONE) {
      this.keyMode = KEY_MODE_WRAPPER_ONLY;
    } else if (this.keyMode === KEY_MODE_ROOT_KEY_ONLY) {
      this.keyMode = KEY_MODE_ROOT_KEY_PLUS_WRAPPER;
    } else {
      throw 'Attempting to set wrapper on already wrapped key.';
    }
    await this.deviceInterface.clearKeychainValue();
    if ((
      this.keyMode === KEY_MODE_WRAPPER_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      if (this.keyMode === KEY_MODE_WRAPPER_ONLY) {
        this.rootKey = wrappingKey;
        await this.itemsKeyManager.reencryptItemsKeys();
      } else {
        await this.wrapAndPersistRootKey({
          wrappingKey: wrappingKey
        });
      }
      await this.storageService.setValue(
        StorageKeys.RootKeyWrapperKeyParams,
        keyParams.getPortableValue(),
        StorageValueModes.Nonwrapped
      );
      await this.notifyObserversOfChange();
    } else {
      throw 'Invalid keyMode on setNewRootKeyWrapper';
    }
  }

  /** 
   * Wraps the current in-memory root key value using the wrappingKey,
   * then persists the wrapped value to disk.
   * @access private 
   */
  async wrapAndPersistRootKey({ wrappingKey }) {
    const payload = CreateMaxPayloadFromAnyObject({
      object: this.rootKey,
      override: {
        content: this.rootKey.getPersistableValue()
      }
    });
    const wrappedKey = await this.protocolService.payloadByEncryptingPayload({
      payload: payload,
      key: wrappingKey,
      intent: EncryptionIntents.LocalStorageEncrypted
    });
    await this.storageService.setValue(
      StorageKeys.WrappedRootKey,
      wrappedKey,
      StorageValueModes.Nonwrapped
    );
  }

  /**
   * @access public
   * Removes root key wrapper from local storage and stores root key bare in secure keychain.
   */
  async removeRootKeyWrapper() {
    if ((
      this.keyMode !== KEY_MODE_WRAPPER_ONLY &&
      this.keyMode !== KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      throw 'Attempting to remove root key wrapper on unwrapped key.';
    }
    if (this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      this.keyMode = KEY_MODE_ROOT_KEY_NONE;
      this.rootKey = null;
    } else if (this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      this.keyMode = KEY_MODE_ROOT_KEY_ONLY;
    }
    await this.storageService.removeValue(
      StorageKeys.WrappedRootKey,
      StorageValueModes.Nonwrapped
    );
    await this.storageService.removeValue(
      StorageKeys.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped
    );
    if (this.keyMode === KEY_MODE_ROOT_KEY_ONLY) {
      await this.saveRootKeyToKeychain();
    }
    await this.notifyObserversOfChange();
  }

  /**
   * @access public
   * The root key is distinct from regular keys and are only saved locally in the keychain,
   * in non-item form. Applications set root key on sign in, register, or password change.
   * @param {SNRootKey} key  A SNRootKey object.
   * @param {SNRootKeyParams} keyParams
   * @param {SNRootKey} [wrappingKey] If a passcode is configured, the wrapping key
   * must be supplied, so that the new root key can be wrapped with the wrapping key.
   */
  async setNewRootKey({ key, keyParams, wrappingKey }) {
    if (!key.isRootKey) {
      throw `Root key must be a ${ContentTypes.RootKey} object.`;
    }
    if (!keyParams) {
      throw 'keyParams must be supplied if setting root key.';
    }
    if (this.rootKey === key) {
      throw 'Attempting to set root key as same current value.';
    }
    if (this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      this.keyMode = KEY_MODE_ROOT_KEY_PLUS_WRAPPER;
    } else if (this.keyMode === KEY_MODE_ROOT_KEY_NONE) {
      this.keyMode = KEY_MODE_ROOT_KEY_ONLY;
    } else if ((
      this.keyMode === KEY_MODE_ROOT_KEY_ONLY ||
      this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER
    )) {
      /** Root key is simply changing, mode stays the same */
      /** this.keyMode = this.keyMode; */
    } else {
      throw `Unhandled key mode for setNewRootKey ${this.keyMode}`;
    }
    this.rootKey = key;
    await this.storageService.setValue(
      StorageKeys.RootKeyParams,
      keyParams.getPortableValue(),
      StorageValueModes.Nonwrapped
    );
    if (this.keyMode === KEY_MODE_ROOT_KEY_ONLY) {
      await this.saveRootKeyToKeychain();
    } else if (this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      if (!wrappingKey) {
        throw Error('wrappingKey must be supplied');
      }
      await this.wrapAndPersistRootKey({ wrappingKey: wrappingKey });
    }
    await this.notifyObserversOfChange(ContentTypes.RootKey);
    await this.itemsKeyManager.reencryptItemsKeys();
  }

  /**
   * Returns the in-memory root key value.
   * @access public
   * @returns {SNRootKey} SNRootKey object
   */
  async getRootKey() {
    return this.rootKey;
  }

  /**
   * @access public
   * Deletes root key and wrapper from keychain. Used when signing out of application.
   */
  async clearLocalKeyState() {
    await this.deviceInterface.clearKeychainValue();
    await this.storageService.removeValue(
      StorageKeys.WrappedRootKey,
      StorageValueModes.Nonwrapped
    );
    await this.storageService.removeValue(
      StorageKeys.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped
    );
    await this.storageService.removeValue(
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    this.keyMode = KEY_MODE_ROOT_KEY_NONE;
    this.rootKey = null;
    await this.notifyObserversOfChange();
  }

  /**
   * @param {string} password  The password string to generate a root key from.
   * @returns {object}  { valid, artifacts : { wrappingKey : object } }
   */
  async validateAccountPassword(password) {
    const keyParams = await this.getRootKeyParams();
    const key = await this.protocolService.computeRootKey({ password, keyParams });
    const valid = key.compare(this.rootKey);
    if (valid) {
      return { valid, artifacts: { rootKey: key } };
    } else {
      return { valid: false };
    }
  }

  /**
   * @param {string} passcode  The passcode string to generate a root key from.
   * @returns {object}  { valid, artifacts : { wrappingKey : object } }
   */
  async validatePasscode(passcode) {
    const keyParams = await this.getRootKeyWrapperKeyParams();
    const key = await this.protocolService.computeRootKey({
      password: passcode,
      keyParams: keyParams
    });
    const valid = await this.validateWrappingKey(key);
    if (valid) {
      return { valid, artifacts: { wrappingKey: key } };
    } else {
      return { valid: false };
    }
  }

  /**
   * Only two types of items should be encrypted with a root key:
   * - An SNItemsKey object
   * - An encrypted storage object (local)
   * @access public
   * @returns {boolean}
   */
  contentTypeUsesRootKeyEncryption(contentType) {
    return (
      contentType === ContentTypes.ItemsKey ||
      contentType === ContentTypes.EncryptedStorage
    );
  }

  /**
   * Determines which key to use for encryption of the payload
   * @access public
   * @returns {SNRootKey|SNItemsKey} 
   * The key object to use for encrypting the payload.
  */
  async keyToUseForEncryptionOfPayload({ payload, intent }) {
    if (isNullOrUndefined(intent)) {
      throw 'Intent must be supplied when looking up key for encryption of item.';
    }
    if (this.contentTypeUsesRootKeyEncryption(payload.content_type)) {
      const rootKey = await this.getRootKey();
      if (!rootKey) {
        if (intentRequiresEncryption(intent)) {
          throw 'Root key encryption is required but no root key is available.';
        } else {
          return null;
        }
      }
      return rootKey;
    } else {
      return this.itemsKeyManager.getDefaultItemsKey();
    }
  }

  /**
   * Payloads could have been previously encrypted with any arbitrary SNItemsKey object.
   * If the payload is an items key object, it is always encrypted with the root key,
   * and so return that. Otherwise, we check to see if the payload has an
   * items_key_id and return that key. If it doesn't, this means the payload was
   * encrypted with legacy behavior. We return then the key object corresponding
   * to the version of this payload.
   * @returns {SNRootKey|SNItemsKey} The key object to use for decrypting this payload.
  */
  async keyToUseForDecryptionOfPayload({ payload }) {
    if (this.contentTypeUsesRootKeyEncryption(payload.content_type)) {
      return this.getRootKey();
    }
    if (payload.items_key_id) {
      const itemsKey = this.itemsKeyManager.itemsKeyForPayload(payload);
      return itemsKey;
    }
    const payloadVersion = payload.version;
    if (payloadVersion === this.protocolService.getLatestVersion()) {
      throw 'No associated key found for item encrypted with latest protocol version.';
    }
    return this.itemsKeyManager.defaultItemsKeyForItemVersion(payloadVersion);
  }
}

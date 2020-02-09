import { PureService } from '@Lib/services/pure_service';
import { isNullOrUndefined, removeFromArray } from '@Lib/utils';
import { CreateMaxPayloadFromAnyObject } from '@Payloads';
import { ContentTypes } from '@Models/content_types';
import { StorageKeys } from '@Lib/storage_keys';
import { SNRootKey, EncryptionIntents, intentRequiresEncryption } from '@Protocol';
import { StorageValueModes } from '@Lib/services/storage_manager';

/** i.e No account and no passcode */
export const KEY_MODE_ROOT_KEY_NONE = 0;
/** i.e Account but no passcode */
export const KEY_MODE_ROOT_KEY_ONLY = 1;
/** i.e Account plus passcode */
export const KEY_MODE_ROOT_KEY_PLUS_WRAPPER = 2;
/** i.e No account, but passcode */
export const KEY_MODE_WRAPPER_ONLY = 3;

export class SNKeyManager extends PureService {
  constructor({ modelManager, storageManager, protocolService, itemsKeyManager }) {
    if (!modelManager || !storageManager || !protocolService || !itemsKeyManager) {
      throw 'Invalid KeyManager construction';
    }
    super();
    this.keyMode = KEY_MODE_ROOT_KEY_NONE;
    this.protocolService = protocolService;
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.itemsKeyManager = itemsKeyManager;
    this.keyObservers = [];

    /** Hide rootKey enumeration */
    Object.defineProperty(this, 'rootKey', {
      enumerable: false,
      writable: true
    });
  }

  async initialize() {
    const wrappedRootKey = await this.getWrappedRootKeyFromStorage();
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
   * @param callback  A function that takes in a content type to call back when root
   *                  key or wrapper status has changed.
   */
  onStatusChange(callback) {
    this.keyObservers.push(callback);
    return () => {
      removeFromArray(this.keyObservers, callback);
    };
  }

  async notifyObserversOfChange() {
    for (const observer of this.keyObservers) {
      await observer();
    }
  }

  /**
   * Dynamically set a DeviceInterface object
   */
  setDeviceInterface(deviceInterface) {
    this.deviceInterface = deviceInterface;
  }

  /** @private */
  async getRootKeyFromKeychain() {
    const rawKey = await this.deviceInterface.getRawKeychainValue();
    if (isNullOrUndefined(rawKey)) {
      return null;
    }
    const rootKey = await SNRootKey.Create({
      content: rawKey
    });
    return rootKey;
  }

  /** @private */
  async saveRootKeyToKeychain() {
    if (isNullOrUndefined(this.rootKey)) {
      throw 'Attempting to non-existent root key to the keychain.';
    }
    if (this.keyMode !== KEY_MODE_ROOT_KEY_ONLY) {
      throw 'Should not be persisting wrapped key to keychain.';
    }
    const rawKey = this.rootKey.getRootValues();
    await this.deviceInterface.setKeychainValue(rawKey);
  }

  /**
   * @public
   * Returns true if a root key wrapper (passcode) is configured.
   */
  async hasRootKeyWrapper() {
    const wrapper = await this.getRootKeyWrapperKeyParams();
    return !isNullOrUndefined(wrapper);
  }

  /**
 * @public
 * Returns true if the root key has not yet been unwrapped (passcode locked).
 */
  async rootKeyNeedsUnwrapping() {
    return await this.hasRootKeyWrapper() && isNullOrUndefined(this.rootKey);
  }

  /**
   * @public
   * @returns  Key params object containing root key wrapper key params
  */
  async getRootKeyWrapperKeyParams() {
    const rawKeyParams = await this.storageManager.getValue(
      StorageKeys.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped
    );
    if (!rawKeyParams) {
      return null;
    }
    return this.protocolService.createKeyParams(rawKeyParams);
  }

  /**
   * @private
   * @returns  Plain object containing persisted wrapped (encrypted) root key
  */
  async getWrappedRootKeyFromStorage() {
    return this.storageManager.getValue(
      StorageKeys.WrappedRootKey,
      StorageValueModes.Nonwrapped
    );
  }

  /**
   * @public
   * @returns  The keyParams saved to disk for root key.
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
   * @public
   * @returns  getRootKeyParams may return different params based on different
   *           keyMode. This function however strictly returns only account params.
   */
  async getAccountKeyParams() {
    const rawKeyParams = await this.storageManager.getValue(
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    if (!rawKeyParams) {
      return null;
    }
    return this.protocolService.createKeyParams(rawKeyParams);
  }

  /**
   * @public
   * We know a wrappingKey is correct if it correctly decrypts
   * wrapped root key.
   */
  async validateWrappingKey(wrappingKey) {
    const wrappedRootKey = await this.getWrappedRootKeyFromStorage();
    /** If wrapper only, storage is encrypted directly with wrappingKey */
    if (this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      return this.storageManager.canDecryptWithKey(wrappingKey);
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
   * @public
   * Application interfaces must check to see if the root key requires unwrapping on load.
   * If so, they must generate the unwrapping key by getting our saved wrapping key keyParams.
   * After unwrapping, the root key is automatically loaded.
  */
  async unwrapRootKey({ wrappingKey }) {
    if (this.keyMode === KEY_MODE_WRAPPER_ONLY) {
      this.rootKey = wrappingKey;
      return;
    }
    if (this.keyMode !== KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      throw 'Invalid key mode condition for unwrapping.';
    }
    const wrappedKey = await this.getWrappedRootKeyFromStorage();
    const payload = CreateMaxPayloadFromAnyObject({ object: wrappedKey });
    const decrypted = await this.protocolService.payloadByDecryptingPayload({
      payload: payload,
      key: wrappingKey
    });
    if (decrypted.errorDecrypting) {
      throw 'Unable to decrypt root key with provided wrapping key.';
    } else {
      this.rootKey = await SNRootKey.Create({
        uuid: decrypted.uuid,
        content: decrypted.content
      });
    }
  }

  /**
   * @public
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
        await this.persistWrappedRootKey({
          wrappingKey: wrappingKey
        });
      }

      await this.storageManager.setValue(
        StorageKeys.RootKeyWrapperKeyParams,
        keyParams.getPortableValue(),
        StorageValueModes.Nonwrapped
      );

      return;
    }

    throw 'Invalid keyMode on setNewRootKeyWrapper';
  }

  /** @private */
  async persistWrappedRootKey({ wrappingKey }) {
    const payload = CreateMaxPayloadFromAnyObject({
      object: this.rootKey,
      override: {
        content: this.rootKey.getRootValues()
      }
    });
    const wrappedKey = await this.protocolService.payloadByEncryptingPayload({
      payload: payload,
      key: wrappingKey,
      intent: EncryptionIntents.LocalStorageEncrypted
    });
    await this.storageManager.setValue(
      StorageKeys.WrappedRootKey,
      wrappedKey,
      StorageValueModes.Nonwrapped
    );
  }

  /**
   * @public
   * Removes root key wrapper from local storage and stores root keys bare in secure keychain.
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

    await this.storageManager.removeValue(
      StorageKeys.WrappedRootKey,
      StorageValueModes.Nonwrapped
    );
    await this.storageManager.removeValue(
      StorageKeys.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped
    );

    if (this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      await this.saveRootKeyToKeychain();
    }
  }

  /**
   * @public
   * The root key is distinct from regular keys and are only saved locally in the keychain,
   * in non-item form. Applications set root key on sign in, register, or password change.
   * @param key  A SNRootKey object.
   */
  async setNewRootKey({ key, keyParams }) {
    if (!key.isRootKey) {
      throw `Root key must be a ${ContentTypes.RootKey} object.`;
    }
    if (!keyParams) {
      throw 'keyParams must be supplied if setting root key.';
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

    const previousRootKey = this.rootKey;
    this.rootKey = key;

    if (previousRootKey === key) {
      throw 'Attempting to set root key as same current value.';
    }

    await this.storageManager.setValue(
      StorageKeys.RootKeyParams,
      keyParams.getPortableValue(),
      StorageValueModes.Nonwrapped
    );
    if (this.keyMode === KEY_MODE_ROOT_KEY_ONLY) {
      await this.saveRootKeyToKeychain();
    } else if (this.keyMode === KEY_MODE_ROOT_KEY_PLUS_WRAPPER) {
      await this.persistWrappedRootKey({ wrappingKey: previousRootKey });
    }

    await this.itemsKeyManager.reencryptItemsKeys();
    await this.notifyObserversOfChange(ContentTypes.RootKey);
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
    await this.deviceInterface.clearKeychainValue();
    await this.storageManager.removeValue(
      StorageKeys.WrappedRootKey,
      StorageValueModes.Nonwrapped
    );
    await this.storageManager.removeValue(
      StorageKeys.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped
    );
    await this.storageManager.removeValue(
      StorageKeys.RootKeyParams,
      StorageValueModes.Nonwrapped
    );
    this.keyMode = KEY_MODE_ROOT_KEY_NONE;
    this.rootKey = null;
  }

  /**
   * @param password {string}: The password string to generate a root key from.
   * @returns key|null: Key if valid password, otherwise null.
   */
  async validateAccountPassword(password) {
    const keyParams = await this.getRootKeyParams();
    const key = await this.protocolService.computeRootKey({ password, keyParams });
    const success = await this.protocolService.compareRootKeys(key, this.rootKey);
    return success ? key : null;
  }

  /**
   * @param passcode {string}: The passcode string to generate a root key from.
   * @returns {boolean}: Whether the input passcode generates wrapping keys equal
   * to the ones saved.
   */
  async validateLocalPasscode(passcode) {
    const keyParams = await this.getRootKeyWrapperKeyParams();
    const key = await this.protocolService.computeRootKey({ passcode, keyParams });
    return this.validateWrappingKey(key);
  }

  /**
   * Only two types of items should be encrypted with a root key:
   * - An SNItemsKey object
   * - An encrypted storage object (local)
   */
  contentTypeUsesRootKeyEncryption(contentType) {
    return (
      contentType === ContentTypes.ItemsKey ||
      contentType === ContentTypes.EncryptedStorage
    );
  }

  /**
   * @returns  The SNItemsKey object to use for encrypting this item.
               For regular items, should be equal too this.getDefaultItemsKey.
               For SNItemsKey items, should be equal to root keys.
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
   * @returns  The SNItemsKey object to use for decrypting this payload.
  */
  async keyToUseForDecryptionOfPayload({ payload }) {
    if (this.contentTypeUsesRootKeyEncryption(payload.content_type)) {
      return this.getRootKey();
    }

    if (payload.items_key_id) {
      const itemsKey = this.itemsKeyManager.itemsKeyForPayload(payload);
      return itemsKey;
    }

    const payloadVersion = this.protocolService.versionForPayload(payload);
    if (payloadVersion === this.protocolService.getLatestVersion()) {
      throw 'No associated key found for item encrypted with latest protocol version.';
    }
    return this.itemsKeyManager.defaultItemsKeyForItemVersion(payloadVersion);
  }
}

import { SNItemKey } from '@Models/keys/itemKey';
import { SNRootKey } from '@Models/keys/rootKey';
import { protocolManager } from '@Protocol/manager';
import { EncryptionIntentLocalStorage } from '@Protocol/intents';
import uniq from 'lodash/uniq';

import {
  WRAPPED_ROOT_KEY,
  WRAPPED_ROOT_KEY_KEY_PARAMS,
  ROOT_KEY_KEY_PARAMS
} from '@Protocol/storageKeys';

export const ITEM_KEY_CONTENT_TYPE        = 'SN|ItemKey';
export const ROOT_KEY_CONTENT_TYPE        = 'SN|RootKey|NoSync';

export class SNKeyManager {
  constructor({modelManager, storageManager}) {
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.itemKeys = [];

    this.modelManager.addItemSyncObserver(
      'key-manager',
      [ITEM_KEY_CONTENT_TYPE],
      (allItems) => {
        this.itemKeys = uniq(this.itemKeys.concat(allItems));
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
   * @returns All SN|ItemKey objects synced to the account.
   */
  get allItemKeys() {
    return this.itemKeys;
  }

  /**
   * Dynamically set an item which conforms to the KeyChain protocol.
   * A delegate must implement the following methods:
   * async setKeyChainValue(value)
   * async getKeyChainValue()
   * async deleteKeyChainValue()
   */
  setKeychainDelegate(delegate) {
    this.keychainDelegate = delegate;
  }

  async getRootKeyFromKeychain() {
    const rawKey = await this.keychainDelegate.getKeyChainValue();
    if(rawKey === null) {
      throw 'Attempting to load non-existent root key from keychain.';
    }
    return new SNRootKey({content: rawKey});
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
    return this.storage.getItem(WRAPPED_ROOT_KEY);
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
    await this.protocolManager.decryptItem(wrappedKey, wrappingKey);
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

    this.rootKey = await this.getRootKeyFromKeychain();
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
    await this.storageManager.setItem(WRAPPED_ROOT_KEY_KEY_PARAMS, keyParams);
    const rootKey = this.rootKey;
    const wrappedKey = await this.protocolManager.generateExportParameters({
      item: rootKey,
      key: wrappingKey,
      intent: EncryptionIntentLocalStorage
    })
    await this.storageManager.setItem(WRAPPED_ROOT_KEY, wrappedKey);
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

    await StorageManager.removeItem(WRAPPED_ROOT_KEY);
    await StorageManager.removeItem(WRAPPED_ROOT_KEY_KEY_PARAMS);

    await this.saveRootKeyToKeychain();
  }

  /**
   * The root key is distinct from regular keys and are only saved locally in the keychain,
   * in non-item form.
   * @param key  A SNRootKey object.
   */
  async setRootKey({key, keyParams}) {
    if(key.content_type !== ROOT_KEY_CONTENT_TYPE) {
      throw `Root key must be a ${ROOT_KEY_CONTENT_TYPE} object.`;
    }

    this.rootKey = key;

    await this.storageManager.setItem(ROOT_KEY_KEY_PARAMS, keyParams.content);
    await this.saveRootKeyToKeychain();
  }

  /**
   * @returns  SNRootKey object
   */
  async getRootKey() {
    const rootValue = await this.delegate.getKeyChainValue();
    return new SNRootKeys(rootValue);
  }

  /**
   * Adds keys and syncs them to account.
   * @param keys  SNItemKey object
   */
  async addNewItemKey(key) {
    this.modelManager.addItem(key);
    key.setDirty(true);
  }

  /**
   * @returns The SNItemKey object to use to encrypt new or updated items.
   */
  async getDefaultItemKey() {
    return this.itemKeys.find((key) => {return key.isDefault === true});
  }

  /**
   * When migrating from non-SNItemKey architecture, many items will not have a relationship with any key object.
   * For those items, we can be sure that only 1 key object will correspond to that protocol version.
   * @returns The SNItemKey object to decrypt items encrypted with previous protocol version.
   */
  async defaultItemKeyForProtocolVersion(version) {
    return this.itemKeys.find((key) => {return key.version === version});
  }

  /**
   * @param uuid  The uuid of the SNItemKey object to return
  */
  async getItemKeyForId(uuid) {
    return this.modelManager.findItem(uuid);
  }

  /**
   * @returns  The SNItemKey object to use for encrypting this item.
               For regular items, should be equal too this.getDefaultItemKey.
               For SNItemKey items, should be equal to root keys.
  */
  async keyToUseForEncryptionOfItem({item, intent}) {
    if(item.content_type === ITEM_KEY_CONTENT_TYPE) {
      return this.getRootKey();
    } else {
      if(this.localDatabaseEncryptionDisabled && intent === SNProtocolManager.IntentLocalStorage) {
        return null;
      }
      return this.getDefaultItemKey();
    }
  }

  /**
   * Items could have been previously encrypted with any arbitrary SNItemKey object.
   * If the item is a key object, it is always encrypted with the root key, and so return that.
   * Otherwise, we check to see if the item has a relationship with any given key.
   * If it doesn't, this means the item was encrypted with legacy behavior. We return then
   * the key object corresponding to the protocol version of this item.
   * @returns  The SNItemKey object to use for decrypting this item.
  */
  async keyToUseForDecryptionOfItem({item}) {
    if(item.content_type === ITEM_KEY_CONTENT_TYPE) {
      return this.getRootKey();
    }

    const matchingReference = item.content.references.find((ref) => {
      return ref.content_type === ITEM_KEY_CONTENT_TYPE;
    });
    if(matchingReference) {
      return this.modelManager.findItem(matchingReference.uuid);
    }

    const itemProtocolVersion = protocolManager.versionForItem(item);
    return this.defaultItemKeyForProtocolVersion(itemProtocolVersion);
  }

  /**
   * Allows interfaces to disable local database encryption for performance reasons (mobile).
   */
  async setLocalDatabaseEncryptionPolicy({encrypted}) {
    this.localDatabaseEncryptionDisabled = !encrypted;
  }

}

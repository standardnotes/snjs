import { SNKeys } from '@Models/core/keys';
import uniq from 'lodash/uniq';

export class SNKeysManager {
  constructor(modelManager) {
    this.modelManager = modelManager;
    this.keys = [];

    this.modelManager.addItemSyncObserver('keys-manager', ['SNKeys'], (allItems) => {
      this.keys = uniq(this.keys.concat(allItems));
    })
  }

  /**
   * @returns All SNKey objects synced to the account (does not include root keys).
   */
  get allKeys() {
    return this.keys;
  }

  /**
   * Dynamically set an item which conforms to the KeyChain protocol.
   * A delegate must implement the following methods:
   * async setKeyChainValue(value)
   * async getKeyChainValue()
   */
  setKeychainDelegate(delegate) {
    this.delegate = delegate;
  }

  /**
   * Root keys are distinct from regular keys and are only saved locally in the keychain,
   * in non-item form. They are extracted from regular SNKey objects to return only the subset of values needed
   * for local saving. Root keys do not appear in the allKeys array.
   * @param keys  A SNKeys object.
   */
  async saveRootKeys(keys) {
    if(keys.constructor.name !== "SNKeys") {
      throw "Keys must be a SNKeys object.";
    }
    const rootValues = keys.rootValues();
    return this.delegate.setKeyChainValue(rootValues);
  }

  /**
   * @returns  SNKeys object with only root values.
   */
  async getRootKeys() {
    const rootValues = await this.delegate.getKeyChainValue(rootValues);
    return new SNKeys(rootValues);
  }

  /**
   * Adds keys and syncs them to account.
   * @param keys  SNKeys object
   */
  async addNewKeys(keys) {
    this.modelManager.addItem(keys);
    keys.setDirty(true);
  }
}

import { SNWebCrypto, isWebCryptoAvailable } from 'sncrypto';
import { SFItem } from '@Models/core/item';
import { SNProtocolOperator001 } from '@Protocol/versions/001/operator_001';
import { SNProtocolOperator002 } from '@Protocol/versions/002/operator_002';
import { SNProtocolOperator003 } from '@Protocol/versions/003/operator_003';
import { SNProtocolOperator004 } from '@Protocol/versions/004/operator_004';

import { SNRootKeyParams001 } from '@Protocol/versions/001/key_params_001';
import { SNRootKeyParams002 } from '@Protocol/versions/002/key_params_002';
import { SNRootKeyParams003 } from '@Protocol/versions/003/key_params_003';
import { SNRootKeyParams004 } from '@Protocol/versions/004/key_params_004';

import {
  isDecryptedIntent,
  intentRequiresEncryption
} from '@Protocol/intents';

import { isWebEnvironment } from '@Lib/utils';

export class SNProtocolManager {

  constructor({modelManager, crypto}) {
    if(!modelManager) {
      throw 'Invalid ProtocolManager construction.';
    }
    this.operators = [];
    this.modelManager = modelManager;
    this.loadCryptoInstance(crypto);
  }

  /**
   * To avoid circular dependencies in constructor, consumers must create a key manager separately
   * and feed it into the protocolManager here.
   * @param keyManager  A fully constructed keyManager
   */
  setKeyManager(keyManager) {
    this.keyManager = keyManager;
    this.keyManager.addItemsKeyChangeObserver({
      name: 'protocol-manager',
      callback: (itemsKeys) => {
        this.decryptItemsWaitingForKeys();
      }
    });
  }

  loadCryptoInstance(crypto) {
    if(!crypto && isWebEnvironment()) {
      // IE and Edge do not support pbkdf2 in WebCrypto.
      if(isWebCryptoAvailable()) {
        this.crypto = new SNWebCrypto();
      } else {
        console.error("WebCrypto is not available.");
      }
    } else {
      this.crypto = crypto;
    }

    SFItem.SetUuidGenerators({
      syncImpl: this.crypto.generateUUIDSync,
      asyncImpl: this.crypto.generateUUIDSync
    })
  }

  version() {
    return "004";
  }

  supportsPasswordDerivationCost(cost) {
    // Some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS or WebCrypto,
    // if user has high password cost and is using browser that doesn't support WebCrypto,
    // we want to tell them that they can't login with this browser.
    if(cost > 5000) {
      return this.crypto instanceof SNWebCrypto;
    } else {
      return true;
    }
  }

  /**
   * @returns  The versions that this library supports.
  */
  supportedVersions() {
    return [
      "001",
      "002",
      "003",
      "004"
    ];
  }

  isVersionNewerThanLibraryVersion(version) {
    const libraryVersion = this.version();
    return parseInt(version) > parseInt(libraryVersion);
  }

  isProtocolVersionOutdated(version) {
    // YYYY-MM-DD
    const expirationDates = {
      "001" : Date.parse("2018-01-01"),
      "002" : Date.parse("2020-01-01"),
    }

    const date = expirationDates[version];
    if(!date) {
      // No expiration date, is active version
      return false;
    }
    const expired = new Date() > date;
    return expired;
  }

  costMinimumForVersion(version) {
    return {
      "001" : SNProtocolOperator001.pwCost(),
      "002" : SNProtocolOperator002.pwCost(),
      "003" : SNProtocolOperator003.pwCost(),
      "004" : SNProtocolOperator004.kdfIterations(),
    }[version];
  }

  versionForItem(item) {
    return item.content.substring(0, 3);
  }

  createOperatorForLatestVersion() {
    return this.createOperatorForVersion(this.version());
  }

  createOperatorForVersion(version) {
    if(version === "001") {
      return new SNProtocolOperator001(this.crypto);
    } else if(version === "002") {
      return new SNProtocolOperator002(this.crypto);
    } else if(version === "003") {
      return new SNProtocolOperator003(this.crypto);
    } else if(version === "004") {
      return new SNProtocolOperator004(this.crypto);
    } else if(version === "000") {
      return this.createOperatorForLatestVersion();
    } else {
      throw `Unable to find operator for version ${version}`
    }
  }

  operatorForVersion(version) {
    const operatorKey = version;
    let operator = this.operators[operatorKey];
    if(!operator) {
      operator = this.createOperatorForVersion(version);
      this.operators[operatorKey] = operator;
    }
    return operator;
  }

  defaultOperator() {
    return this.operatorForVersion(this.version());
  }

  async computeRootKey({password, keyParams}) {
    const version = keyParams.version;
    const operator = this.operatorForVersion(version);
    return operator.computeRootKey({password, keyParams});
  }

  async createRootKey({identifier, password}) {
    const operator = this.defaultOperator();
    return operator.createRootKey({identifier, password});
  }

  async encryptItem({item, intent}) {
    if(!item.uuid) {
      await item.initUUID();
    }
    const key = await this.keyManager.keyToUseForEncryptionOfItem({item, intent});
    if(!key) {
      throw 'Attempting to encrypt item with no key.';
    }
    const version = key.version;
    const operator = this.operatorForVersion(version);
    return operator.encryptItem({item, key});
  }

  /**
   * Decrypts the input item in-place.
   * @param item  The item to decrypt.
   * @param key - Optional. The key to use to decrypt the item. If none is supplied, it will be automatically looked up.
   */
  async decryptItem({item, key}) {
    if(!key) {
      key = await this.keyManager.keyToUseForDecryptionOfItem({item});
    }
    if(!key) {
      item.waitingForKey = true;
      item.errorDecrypting = true;
      return false;
    }
    const version = this.versionForItem(item);
    const operator = this.operatorForVersion(version);
    return operator.decryptItem({item, key});
  }

  async decryptMultipleItems(items, throws) {
    for(const item of items) {
      if(!item) {
        continue;
      }

      // We still want to decrypt deleted items if they have content in case they were marked as dirty but not yet synced.
      if(item.deleted === true && item.content === null) {
        continue;
      }

      const isDecryptable = typeof item.content === 'string' || item.content instanceof String;
      if(!isDecryptable)  {
        continue;
      }

      try {
        await this.decryptItem({item});
      } catch (e) {
        if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
        item.errorDecrypting = true;
        if(throws) { throw e; }
        console.error("Error decrypting item", item, e);
      }
    }
  }

  /**
   * If an item was attempting to decrypt, but the keys for that item have not downloaded yet,
   * it will be deferred with item.waitingForKey = true. Here we find such items, and attempt to decrypt them,
   * given new set of keys having potentially arrived.
   */
  async decryptItemsWaitingForKeys() {
    const itemsWaitingForKeys = this.modelManager.allItems.filter((item) => item.waitingForKey === true);
    await this.decryptMultipleItems(itemsWaitingForKeys);
  }

  /**
   * Generates parameters for an item that are typically encrypted, and used for syncing or saving locally.
   * Parameters are non-typed objects that can later by converted to objects.
   * @param key Optional. The key to use to encrypt the item. Will be looked up if not supplied.
   * @returns A plain key/value object.
   */
  async generateExportParameters({item, key, includeDeleted, intent}) {
    if(!key && !isDecryptedIntent(intent)) {
      key = await this.keyManager.keyToUseForEncryptionOfItem({item, intent});
    }
    if(!key && intentRequiresEncryption(intent)) {
      throw 'Attempting to generate encrypted export params with no key.';
    }
    const version = key ? key.version : this.version();
    const operator = this.operatorForVersion(version);
    return operator.generateExportParameters({item, key, includeDeleted, intent});
  }

  /**
   * Compares two keys for equality
   * @returns Boolean
  */
  async compareKeys(keyA, keyB) {
    return keyA.compare(keyB);
  }

  createVersionedKeyParams(keyParams) {
    // 002 doesn't have version automatically, newer versions do.
    const version = keyParams.version || "002";

    switch (version) {
      case "001":
        return new SNRootKeyParams001(keyParams);
      case "002":
        return new SNRootKeyParams002(keyParams);
      case "003":
        return new SNRootKeyParams003(keyParams);
      case "004":
        return new SNRootKeyParams004(keyParams);
    }

    throw "No auth params version found.";
  }

  /**
   * Computes a hash of all items updated_at strings joined with a comma.
   * The server will also do the same, to determine whether the client values match server values.
   * @returns A SHA256 digest string (hex).
   */
  async computeDataIntegrityHash() {
    try {
      let items = this.allNondummyItems.sort((a, b) => {
        return b.updated_at - a.updated_at;
      })
      let dates = items.map((item) => item.updatedAtTimestamp());
      let string = dates.join(",");
      let hash = await protocolManager.crypto.sha256(string);
      return hash;
    } catch (e) {
      console.error("Error computing data integrity hash", e);
      return null;
    }
  }

  async getRootKeyKeyParams() {
    return this.keyManager.getRootKeyKeyParams();
  }
}

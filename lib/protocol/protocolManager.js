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

import * as versions from '@Protocol/versions';

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

  latestVersion() {
    return versions.PROTOCOL_VERSION_004;
  }

  async getUserVersion() {
    const keyParams = this.keyManager.getRootKeyParams();
    return keyParams && keyParams.version;
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
      versions.PROTOCOL_VERSION_001,
      versions.PROTOCOL_VERSION_002,
      versions.PROTOCOL_VERSION_003,
      versions.PROTOCOL_VERSION_004,
    ];
  }

  isVersionNewerThanLibraryVersion(version) {
    const libraryVersion = this.latestVersion();
    return parseInt(version) > parseInt(libraryVersion);
  }

  isProtocolVersionOutdated(version) {
    // YYYY-MM-DD
    const expirationDates = {}
    expirationDates[versions.PROTOCOL_VERSION_001] = Date.parse("2018-01-01");
    expirationDates[versions.PROTOCOL_VERSION_002] = Date.parse("2020-01-01");

    const date = expirationDates[version];
    if(!date) {
      // No expiration date, is active version
      return false;
    }
    const expired = new Date() > date;
    return expired;
  }

  costMinimumForVersion(version) {
    switch (version) {
      case versions.PROTOCOL_VERSION_001:
        return SNProtocolOperator001.pwCost();
      case versions.PROTOCOL_VERSION_002:
        return SNProtocolOperator002.pwCost();
      case versions.PROTOCOL_VERSION_003:
        return SNProtocolOperator003.pwCost();
      case versions.PROTOCOL_VERSION_004:
        return SNProtocolOperator004.kdfIterations();
      default:
        throw `Unable to find cost minimum for version ${version}`;
    }
  }

  versionForPayload(item) {
    return item.content.substring(0, versions.SN_PROTOCOL_VERSION_LENGTH);
  }

  createOperatorForLatestVersion() {
    return this.createOperatorForVersion(this.latestVersion());
  }

  createOperatorForVersion(version) {
    if(version === versions.PROTOCOL_VERSION_001) {
      return new SNProtocolOperator001(this.crypto);
    } else if(version === versions.PROTOCOL_VERSION_002) {
      return new SNProtocolOperator002(this.crypto);
    } else if(version === versions.PROTOCOL_VERSION_003) {
      return new SNProtocolOperator003(this.crypto);
    } else if(version === versions.PROTOCOL_VERSION_004) {
      return new SNProtocolOperator004(this.crypto);
    } else if(version === versions.PROTOCOL_VERSION_BASE_64_DECRYPTED) {
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
    return this.operatorForVersion(this.latestVersion());
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

  async getRootKeyParams() {
    return this.keyManager.getRootKeyParams();
  }

  // async generateEncryptionPayload({item, intent}) {
  //   if(
  //     key.content_type === SN_ROOT_KEY_CONTENT_TYPE
  //     && !this.keyManager.contentTypeUsesRootKeyEncryption(item.content_type)
  //   ) {
  //     throw `Attempting to encrypt item ${item.content_type} with root key instead of items key.`;
  //   }
  //   if(!item.uuid) {
  //     await item.initUUID();
  //   }
  //   const key = await this.keyManager.keyToUseForEncryptionOfItem({item, intent});
  //   if(!key) {
  //     console.trace(); throw 'Attempting to encrypt item with no key.';
  //   }
  //   const version = key.version;
  //   const operator = this.operatorForVersion(version);
  //   return operator.generateEncryptionPayload({item, key});
  // }

  /**
   * Decrypts the input item in-place.
   * @param item  The item to decrypt.
   * @param key - Optional. The key to use to decrypt the item. If none is supplied, it will be automatically looked up.
   */
  async decryptItemPayload({payload, key}) {
    if(!key) {
      key = await this.keyManager.keyToUseForDecryptionOfPayload({payload});
    }
    if(!key) {
      payload.waitingForKey = true;
      payload.errorDecrypting = true;
      return false;
    }
    const version = this.versionForPayload(payload);
    const operator = this.operatorForVersion(version);
    return operator.decryptItemPayload({payload, key});
  }

  async decryptMultipleItemPayloads(payloads, throws) {
    for(const payload of payloads) {
      if(!payload) {
        continue;
      }

      // We still want to decrypt deleted items if they have content in case they were marked as dirty but not yet synced.
      if(payload.deleted === true && payload.content === null) {
        continue;
      }

      const isDecryptable = typeof payload.content === 'string' || payload.content instanceof String;
      if(!isDecryptable)  {
        continue;
      }

      try {
        await this.decryptItemPayload({payload});
      } catch (e) {
        if(!payload.errorDecrypting) { payload.errorDecryptingValueChanged = true;}
        payload.errorDecrypting = true;
        if(throws) { throw e; }
        console.error("Error decrypting payload", payload, e);
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
    await this.decryptMultipleItemPayloads(itemsWaitingForKeys);
  }

  /**
   * Generates parameters for an item that are typically encrypted, and used for syncing or saving locally.
   * Parameters are non-typed objects that can later by converted to objects.
   * @param key Optional. The key to use to encrypt the item. Will be looked up if not supplied.
   * @param includeDeleted  Whether the individual item payload should contain the `deleted` key.
   * @returns A plain key/value object.
   */
  async generateItemPayload({item, key, includeDeleted, intent}) {
    if(!key && !isDecryptedIntent(intent)) {
      key = await this.keyManager.keyToUseForEncryptionOfItem({item, intent});
    }
    if(!key && intentRequiresEncryption(intent)) {
      throw 'Attempting to generate encrypted export params with no key.';
    }

    if(key && key.isItemsKey) {
      item.addItemAsRelationship(key);
    }

    const version = key ? key.version : this.latestVersion();
    const operator = this.operatorForVersion(version);
    const parameters = await operator.generateItemPayload({item, key, includeDeleted, intent});
    if(!parameters) {
      throw 'Unable to generate export parameters';
    }
    return parameters;
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
      case versions.PROTOCOL_VERSION_001:
        return new SNRootKeyParams001(keyParams);
      case versions.PROTOCOL_VERSION_002:
        return new SNRootKeyParams002(keyParams);
      case versions.PROTOCOL_VERSION_003:
        return new SNRootKeyParams003(keyParams);
      case versions.PROTOCOL_VERSION_004:
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
}

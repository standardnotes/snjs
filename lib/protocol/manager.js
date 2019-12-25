import { SNWebCrypto, isWebCryptoAvailable } from 'sncrypto';
import { SNProtocolOperator001 } from "@Protocol/versions/001/operator_001";
import { SNProtocolOperator002 } from "@Protocol/versions/002/operator_002";
import { SNProtocolOperator003 } from "@Protocol/versions/003/operator_003";
import { SNProtocolOperator004 } from "@Protocol/versions/004/operator_004";

import { SNRootKeyParams001 } from "@Protocol/versions/001/key_params_001";
import { SNRootKeyParams002 } from "@Protocol/versions/002/key_params_002";
import { SNRootKeyParams003 } from "@Protocol/versions/003/key_params_003";
import { SNRootKeyParams004 } from "@Protocol/versions/004/key_params_004";

import { isWebEnvironment } from "@Lib/utils";

export class SNProtocolManager {

  constructor(cryptoInstance) {
    this.operators = [];
    if(!cryptoInstance && isWebEnvironment()) {
      // IE and Edge do not support pbkdf2 in WebCrypto.
      if(isWebCryptoAvailable()) {
        this.crypto = new SNWebCrypto();
      } else {
        console.error("WebCrypto is not available.");
      }
    } else {
      this.crypto = cryptoInstance;
    }
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

  async decryptItem({item, key}) {
    const version = this.versionForItem(item);
    const operator = this.operatorForVersion(version);
    return operator.decryptItem({item, key});
  }

  async encryptItem({item, key, keyParams}) {
    if(!item.uuid) {
      await item.initUUID();
    }
    const version = keyParams.version;
    const operator = this.operatorForVersion(version);
    return operator.encryptItem({item, key, keyParams});
  }

  /**
   * Generates parameters for an item that are typically encrypted, and used for syncing or saving locally.
   * Parameters are non-typed objects that can later by converted to objects.
   * @returns A plain key/value object.
   */
  async generateExportParameters({item, key, keyParams, includeDeleted, intent}) {
    const version = keyParams.version;
    const operator = this.operatorForVersion(version);
    return operator.generateExportParameters({item, key, keyParams, includeDeleted, intent});
  }

  /**
   * Compares two keys for equality
   * @returns Boolean
  */
  async compareKeys(keyA, keyB) {
    return keyA.compare(keyB);
  }

  async decryptMultipleItems(items, key, throws) {
    const decrypt = async (item) => {
      if(!item) { return; }

      // Adding item.content == null clause. We still want to decrypt deleted items incase they were marked as dirty but not yet synced.
      if(item.deleted === true && item.content === null) {
        return;
      }

      const isString = typeof item.content === 'string' || item.content instanceof String;
      if(isString) {
        try {
          await this.decryptItem({item, key});
        } catch (e) {
          if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
          item.errorDecrypting = true;
          if(throws) { throw e; }
          console.error("Error decrypting item", item, e);
          return;
        }
      }
    }

    return Promise.all(items.map((item) => {
      return decrypt(item);
    }));
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

}

const protocolManager = new SNProtocolManager();
export { protocolManager };

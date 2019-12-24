import { SNWebCrypto, isWebCryptoAvailable } from 'sncrypto';
import { SNProtocolOperator001 } from "@Protocol/versions/001/operator_001";
import { SNProtocolOperator002 } from "@Protocol/versions/002/operator_002";
import { SNProtocolOperator003 } from "@Protocol/versions/003/operator_003";
import { SNProtocolOperator004 } from "@Protocol/versions/004/operator_004";

import { SNAuthParams001 } from "@Protocol/versions/001/auth_params_001";
import { SNAuthParams002 } from "@Protocol/versions/002/auth_params_002";
import { SNAuthParams003 } from "@Protocol/versions/003/auth_params_003";
import { SNAuthParams004 } from "@Protocol/versions/004/auth_params_004";

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

  async computeEncryptionKeys({password, authParams}) {
    const version = authParams.version;
    const operator = this.operatorForVersion(version);
    return operator.computeEncryptionKeys({password, authParams});
  }

  async createKeysAndAuthParams({identifier, password}) {
    const operator = this.defaultOperator();
    return operator.createKeysAndAuthParams({identifier, password});
  }

  async decryptItem({item, keys}) {
    const version = this.versionForItem(item);
    const operator = this.operatorForVersion(version);
    return operator.decryptItem({item, keys});
  }

  async encryptItem({item, keys, authParams}) {
    const version = authParams.version;
    const operator = this.operatorForVersion(version);
    return operator.encryptItem({item, keys, authParams});
  }

  /**
   * Compares two sets of keys for equality
   * @returns Boolean
  */
  async compareKeys(keysA, keysB) {
    return keysA.compare(keysB);
  }

  async decryptMultipleItems(items, keys, throws) {
    const decrypt = async (item) => {
      if(!item) { return; }

      // Adding item.content == null clause. We still want to decrypt deleted items incase they were marked as dirty but not yet synced.
      if(item.deleted === true && item.content === null) {
        return;
      }

      const isString = typeof item.content === 'string' || item.content instanceof String;
      if(isString) {
        try {
          await this.decryptItem({item, keys});
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

  createVersionedAuthParams(authParams) {
    // 002 doesn't have version automatically, newer versions do.
    const version = authParams.version || "002";

    switch (version) {
      case "001":
        return new SNAuthParams001(authParams);
      case "002":
        return new SNAuthParams002(authParams);
      case "003":
        return new SNAuthParams003(authParams);
      case "004":
        return new SNAuthParams004(authParams);
    }

    throw "No auth params version found.";
  }

}

const protocolManager = new SNProtocolManager();
export { protocolManager };

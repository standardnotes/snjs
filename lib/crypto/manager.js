import { SFCryptoWeb } from '@Crypto/lib/webcrypto';
import { SFCryptoJS } from '@Crypto/lib/cryptojs';
import { SNCryptoOperator001 } from "@Crypto/operator/001/operator_001";
import { SNCryptoOperator002 } from "@Crypto/operator/002/operator_002";
import { SNCryptoOperator003 } from "@Crypto/operator/003/operator_003";
import { isWebEnvironment, isWebCryptoAvailable } from "@Lib/utils";

export class SNCryptoManager {

  constructor(cryptoInstance) {
    this.operators = [];
    if(!cryptoInstance && isWebEnvironment()) {
      // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
      if(isWebCryptoAvailable()) {
        this.crypto = new SFCryptoWeb();
      } else {
        this.crypto = new SFCryptoJS();
      }
    } else {
      this.crypto = cryptoInstance;
    }
  }

  version() {
    return "003";
  }

  supportsPasswordDerivationCost(cost) {
    // some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS,
    // which CryptoJS can't handle here (WebCrypto can however).
    // if user has high password cost and is using browser that doesn't support WebCrypto,
    // we want to tell them that they can't login with this browser.
    if(cost > 5000) {
      return this.crypto instanceof SFCryptoWeb;
    } else {
      return true;
    }
  }

  // Returns the versions that this library supports technically.
  supportedVersions() {
    return [
      "001",
      "002",
      "003"
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
      "001" : SNCryptoOperator001.pwCost(),
      "002" : SNCryptoOperator002.pwCost(),
      "003" : SNCryptoOperator003.pwCost()
    }[version];
  }

  defaultPasswordGenerationCost() {
    return this.costMinimumForVersion(this.version());
  }

  versionForItem(item) {
    return item.content.substring(0, 3);
  }

  createOperatorForLatestVersion() {
    return this.createOperatorForVersion(this.version());
  }

  createOperatorForVersion(version) {
    if(version === "001") {
      return new SNCryptoOperator001(this.crypto);
    } else if(version === "002") {
      return new SNCryptoOperator002(this.crypto);
    } else if(version === "003") {
      return new SNCryptoOperator003(this.crypto);
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

  async computeEncryptionKeysForUser(password, authParams) {
    const version = authParams.version;
    const operator = this.operatorForVersion(version);
    return operator.computeEncryptionKeysForUser(password, authParams);
  }

  async generateInitialKeysAndAuthParamsForUser(identifier, password) {
    const operator = this.defaultOperator();
    return operator.generateInitialKeysAndAuthParamsForUser(identifier, password);
  }

  async decryptItem(item, keys) {
    const version = this.versionForItem(item);
    const operator = this.operatorForVersion(version);
    return operator.decryptItem(item, keys);
  }

  async encryptItem(item, keys, authParams) {
    const version = authParams.version;
    const operator = this.operatorForVersion(version);
    return operator.encryptItem(item, keys, authParams);
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
          await this.decryptItem(item, keys);
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
}

const cryptoManager = new SNCryptoManager();
export { cryptoManager };

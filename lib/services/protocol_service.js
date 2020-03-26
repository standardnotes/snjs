import { PureService } from '@Lib/services/pure_service';
import { SNWebCrypto, isWebCryptoAvailable } from 'sncrypto';
import { Uuid } from '@Lib/uuid';
import {
  CreateEncryptionParameters,
  CreateIntentPayloadFromObject,
  CreateSourcedPayloadFromObject,
  CreateMaxPayloadFromAnyObject,
  PayloadSources,
  PayloadFormats,
  PayloadFields
} from '@Payloads';
import {
  isWebEnvironment,
  isString,
  isNullOrUndefined,
  isFunction
} from '@Lib/utils';
import {
  isDecryptedIntent,
  intentRequiresEncryption,
  SNProtocolOperator001,
  SNProtocolOperator002,
  SNProtocolOperator003,
  SNProtocolOperator004,
  CreateKeyParams,
  ProtocolVersions,
  compareVersions,
  EncryptionIntents
} from '@Protocol';

/**
 * The protocol service is responsible for the encryption and decryption of payloads, and
 * handles delegation of a task to the respective protocol operator. Each version of the protocol
 * (001, 002, 003, 004, etc) uses a respective operator version to perform encryption operations.
 * Operators are located in /protocol/operator.
 * The protocol service depends on the keyManager for determining which key to use for the 
 * encryption and decryption of a particular payload.
 * The protocol service is also responsible for dictating which protocol versions are valid,
 * and which are no longer valid or not supported.
 */
export class SNProtocolService extends PureService {
  constructor({ modelManager, crypto }) {
    if (!modelManager) {
      throw 'Invalid ProtocolService construction.';
    }
    super();
    this.operators = {};
    this.modelManager = modelManager;
    this.crypto = crypto;
    if (!this.crypto && isWebEnvironment() && isWebCryptoAvailable()) {
      /** IE and Edge do not support pbkdf2 in WebCrypto. */
      this.crypto = new SNWebCrypto();
    }
    Uuid.SetGenerators({
      syncImpl: this.crypto.generateUUIDSync,
      asyncImpl: this.crypto.generateUUIDSync
    });
  }

  /** @override */
  deinit() {
    this.modelManager = null;
    this.crypto.deinit();
    this.crypto = null;
    this.operators = null;
    this.keyManager = null;
    this.keyObsUnsubscribe();
    this.keyObsUnsubscribe = null;
    super.deinit();
  }

  /**
   * To avoid circular dependencies in constructor, applications must create
   * a key manager separately and feed it into the protocolService here.
   * @param keyManager  A fully constructed keyManager
   */
  setKeyManager(keyManager) {
    this.keyManager = keyManager;
  }

  setItemsKeyManager(itemsKeyManager) {
    this.keyObsUnsubscribe = itemsKeyManager.addItemsKeyChangeObserver(async () => {
      await this.decryptErroredItems();
    });
  }

  /**
   * Returns the latest protocol version
   * @access public
   */
  getLatestVersion() {
    return ProtocolVersions.V004;
  }

  /** 
   * Returns the protocol version associated with the user's account
   * @access public
   */
  async getUserVersion() {
    const keyParams = await this.keyManager.getAccountKeyParams();
    return keyParams && keyParams.version;
  }

  /** 
   * Returns true if there is an upgrade available for the account or passcode
   * @access public 
   */
  async upgradeAvailable() {
    const accountUpgradeAvailable = await this.accountUpgradeAvailable();
    const passcodeUpgradeAvailable = await this.passcodeUpgradeAvailable();
    return accountUpgradeAvailable || passcodeUpgradeAvailable;
  }

  /** 
   * Returns true if the user's account protocol version is not equal to the latest version.
   * @access public 
   */
  async accountUpgradeAvailable() {
    const userVersion = await this.getUserVersion();
    if (!userVersion) {
      return false;
    }
    return userVersion !== this.getLatestVersion();
  }

  /** 
   * Returns true if the user's account protocol version is not equal to the latest version.
   * @access public 
   */
  async passcodeUpgradeAvailable() {
    const passcodeParams = await this.keyManager.getRootKeyWrapperKeyParams();
    if (!passcodeParams) {
      return false;
    }
    return passcodeParams.version !== this.getLatestVersion();
  }


  /**
   * Determines whether the current environment is capable of supporting
   * key derivation.
   * @access public
   * @param {SNRootKeyParams} keyParams 
   */
  platformSupportsKeyDerivation(keyParams) {
    /**
     * If the version is 003 or lower, key derivation is supported unless the browser is
     * IE or Edge (or generally, where WebCrypto is not available).
     * 
     * Versions 004 and above are always supported.
     */
    if (compareVersions(keyParams.version, ProtocolVersions.V004) >= 0) {
      /* keyParams.version >= 004 */
      return true;
    } else {
      return !!isWebCryptoAvailable();
    }
  }

  /**
   * @access public
   * @returns {Array.<string>} The versions that this library supports.
   */
  supportedVersions() {
    return [
      ProtocolVersions.V001,
      ProtocolVersions.V002,
      ProtocolVersions.V003,
      ProtocolVersions.V004,
    ];
  }

  /**
   * Determines whether the input version is greater than the latest supported library version.
   * @access public
   * @param {string} version 
   */
  isVersionNewerThanLibraryVersion(version) {
    const libraryVersion = this.getLatestVersion();
    return compareVersions(version, libraryVersion) === 1;
  }

  /**
   * Determines whether the input version is expired
   * @access public
   * @param {string} version 
   */
  isProtocolVersionOutdated(version) {
    const expirationDates = {};
    expirationDates[ProtocolVersions.V001] = Date.parse('2018-01-01');
    expirationDates[ProtocolVersions.V002] = Date.parse('2020-01-01');
    const date = expirationDates[version];
    if (!date) {
      /* No expiration date, is active version */
      return false;
    }
    const expired = new Date() > date;
    return expired;
  }

  /**
   * Versions 001 and 002 of the protocol supported dynamic costs, as reported by the server.
   * This function returns the client-enforced minimum cost, to prevent the server from
   * overwhelmingly under-reporting the cost.
   * @access public
   * @param {string} version 
   * @returns {number}
   */
  costMinimumForVersion(version) {
    if (compareVersions(version, ProtocolVersions.V003) >= 0) {
      throw 'Cost minimums only apply to versions <= 002';
    }
    if (version === ProtocolVersions.V001) {
      return SNProtocolOperator001.pwCost();
    } else if (version === ProtocolVersions.V002) {
      return SNProtocolOperator002.pwCost();
    } else {
      throw `Invalid version for cost minimum: ${version}`;
    }
  }

  /** 
   * @access private 
   * @returns {SNProtocolOperator}
   */
  createOperatorForLatestVersion() {
    return this.createOperatorForVersion(this.getLatestVersion());
  }

  /**
   * @access private
   * @returns {SNProtocolOperator}
   */
  createOperatorForVersion(version) {
    if (version === ProtocolVersions.V001) {
      return new SNProtocolOperator001(this.crypto);
    } else if (version === ProtocolVersions.V002) {
      return new SNProtocolOperator002(this.crypto);
    } else if (version === ProtocolVersions.V003) {
      return new SNProtocolOperator003(this.crypto);
    } else if (version === ProtocolVersions.V004) {
      return new SNProtocolOperator004(this.crypto);
    } else if (version === ProtocolVersions.V000Base64Decrypted) {
      return this.createOperatorForLatestVersion();
    } else {
      throw `Unable to find operator for version ${version}`;
    }
  }

  /**
   * @access private
   * @returns {SNProtocolOperator}
   */
  operatorForVersion(version) {
    const operatorKey = version;
    let operator = this.operators[operatorKey];
    if (!operator) {
      operator = this.createOperatorForVersion(version);
      this.operators[operatorKey] = operator;
    }
    return operator;
  }

  /**
   * Returns the operator corresponding to the latest protocol version
   * @access private
   * @returns {SNProtocolOperator}
   */
  defaultOperator() {
    return this.operatorForVersion(this.getLatestVersion());
  }

  /**
   * Computes a root key given a password and key params.
   * Delegates computation to respective protocol operator.
   * @access public
   * @returns {SNRootKey}
   */
  async computeRootKey({ password, keyParams }) {
    const version = keyParams.version;
    const operator = this.operatorForVersion(version);
    return operator.computeRootKey({ password, keyParams });
  }

  /**
   * Creates a root key using the latest protocol version
   * @access public
   * @returns {SNRootKey}
  */
  async createRootKey({ identifier, password }) {
    const operator = this.defaultOperator();
    return operator.createRootKey({ identifier, password });
  }

  /**
   * Given a key and intent, returns the proper PayloadFormat,
   * or throws an exception if unsupported configuration of parameters.
   * @access private
   * @returns {PayloadFormat}
   */
  payloadContentFormatForIntent({ key, intent }) {
    if (!key) {
      /** Decrypted */
      if ((
        intent === EncryptionIntents.LocalStorageDecrypted ||
        intent === EncryptionIntents.LocalStoragePreferEncrypted ||
        intent === EncryptionIntents.FileDecrypted ||
        intent === EncryptionIntents.FilePreferEncrypted
      )) {
        return PayloadFormats.DecryptedBareObject;
      } else if ((
        intent === EncryptionIntents.SyncDecrypted
      )) {
        return PayloadFormats.DecryptedBase64String;
      } else {
        throw 'Unhandled decrypted case in protocolService.payloadContentFormatForIntent.';
      }
    } else {
      /** Encrypted */
      if ((
        intent === EncryptionIntents.Sync ||
        intent === EncryptionIntents.FileEncrypted ||
        intent === EncryptionIntents.FilePreferEncrypted ||
        intent === EncryptionIntents.LocalStorageEncrypted ||
        intent === EncryptionIntents.LocalStoragePreferEncrypted
      )) {
        return PayloadFormats.EncryptedString;
      } else {
        throw 'Unhandled encrypted case in protocolService.payloadContentFormatForIntent.';
      }
    }
  }

  /**
   * Generates parameters for a payload that are typically encrypted, and used for syncing
   * or saving locally. Parameters are non-typed objects that can later by converted to objects.
   * If the input payload is not properly decrypted in the first place, it will be returned
   * as-is.
   * @access public
   * @param {Payload} payload - The payload to encrypt
   * @param {SNRootKey|SNItemsKey} [key] - Optional. The key to use to encrypt the payload. 
   *   Will be looked up if not supplied.
   * @param {EncryptionIntents} intent - The target of the encryption
   * @returns {Payload} The encrypted payload
   */
  async payloadByEncryptingPayload({ payload, key, intent }) {
    if (payload.errorDecrypting) {
      return payload;
    }
    if (isNullOrUndefined(intent)) {
      throw 'Attempting to encrypt payload with null intent';
    }
    if (!key && !isDecryptedIntent(intent)) {
      key = await this.keyManager.keyToUseForEncryptionOfPayload({ payload, intent });
    }
    if (!key && intentRequiresEncryption(intent)) {
      throw 'Attempting to generate encrypted payload with no key.';
    }
    if (payload.getFormat() !== PayloadFormats.DecryptedBareObject) {
      throw 'Attempting to encrypt already encrypted payload.';
    }
    if (!payload.isPayload) {
      throw 'Attempting to encrypt non-payload.';
    }
    if (!payload.content) {
      throw 'Attempting to encrypt payload with no content.';
    }
    if (!payload.uuid) {
      throw 'Attempting to encrypt payload with no uuid.';
    }
    const version = key ? key.version : this.getLatestVersion();
    const format = this.payloadContentFormatForIntent({ key, intent });
    const operator = this.operatorForVersion(version);
    const encryptionParameters = await operator.generateEncryptionParameters({
      payload,
      key,
      format
    });
    if (!encryptionParameters) {
      throw 'Unable to generate encryption parameters';
    }
    return CreateIntentPayloadFromObject({
      object: payload,
      override: encryptionParameters,
      intent: intent
    });
  }

  /**
   * Similar to `payloadByEncryptingPayload`, but operates on an array of payloads.
   * `intent` can also be a function of the current iteration payload.
   * @access public
   * @param {Array.<Payload>} payloads
   * @param {EncryptionIntent|function} intent
   * @returns {Array.<Payload>}
   */
  async payloadsByEncryptingPayloads({ payloads, intent }) {
    const results = [];
    for (const payload of payloads) {
      const useIntent = isFunction(intent) ? intent(payload) : intent;
      const encryptedPayload = await this.payloadByEncryptingPayload({
        payload: payload,
        intent: useIntent
      });
      results.push(encryptedPayload);
    }
    return results;
  }

  /**
   * Generates a new payload by decrypting the input payload.
   * If the input payload is already decrypted, it will be returned as-is.
   * @access public
   * @param {Payload} payload - The payload to decrypt.
   * @param {SNRootKey|SNItemsKey} [key] - Optional. The key to use to decrypt the payload. 
   *              If none is supplied, it will be automatically looked up.
   * @returns {Payload}
   */
  async payloadByDecryptingPayload({ payload, key }) {
    if (!payload.content) {
      throw 'Attempting to decrypt payload that has no content.';
    }
    if (!payload.isPayload) {
      throw 'Attempting to decrypt non-payload.';
    }
    const format = payload.getFormat();
    if (format === PayloadFormats.DecryptedBareObject) {
      return payload;
    }
    if (!key && format === PayloadFormats.EncryptedString) {
      key = await this.keyManager.keyToUseForDecryptionOfPayload({ payload });
      if (!key) {
        return CreateMaxPayloadFromAnyObject({
          object: payload,
          override: {
            waitingForKey: true,
            errorDecrypting: true
          }
        });
      }
    }
    const version = payload.version;
    const operator = this.operatorForVersion(version);
    const encryptionParameters = CreateEncryptionParameters(payload);
    const decryptedParameters = await operator.generateDecryptedParameters({
      encryptedParameters: encryptionParameters,
      key: key
    });
    return CreateMaxPayloadFromAnyObject({
      object: payload,
      override: decryptedParameters
    });
  }

  /**
   * Similar to `payloadByDecryptingPayload`, but operates on an array of payloads.
   * @access public
   * @param {Array.<Payload>} payloads
   * @param {SNRootKey|SNItemsKey} [key] - Optional
   * @returns {Array.<Payload>}
   */
  async payloadsByDecryptingPayloads({ payloads, key }) {
    const decryptedPayloads = [];
    for (const encryptedPayload of payloads) {
      if (!encryptedPayload) {
        /** Keep in-counts similar to out-counts */
        decryptedPayloads.push(encryptedPayload);
        continue;
      }
      if (!encryptedPayload.isPayload) {
        throw 'Attempting to decrypt non-payload object in payloadsByDecryptingPayloads.';
      }
      /**
       * We still want to decrypt deleted payloads if they have content in case
       * they were marked as dirty but not yet synced.
       */
      if (encryptedPayload.deleted === true && isNullOrUndefined(encryptedPayload.content)) {
        decryptedPayloads.push(encryptedPayload);
        continue;
      }
      const isDecryptable = isString(encryptedPayload.content);
      if (!isDecryptable) {
        decryptedPayloads.push(encryptedPayload);
        continue;
      }
      try {
        const decryptedPayload = await this.payloadByDecryptingPayload({
          payload: encryptedPayload,
          key: key
        });
        decryptedPayloads.push(decryptedPayload);
      } catch (e) {
        decryptedPayloads.push(CreateMaxPayloadFromAnyObject({
          object: encryptedPayload,
          override: {
            [PayloadFields.ErrorDecrypting]: true,
            [PayloadFields.ErrorDecryptingChanged]: !encryptedPayload.errorDecrypting
          }
        }));
        console.error('Error decrypting payload', encryptedPayload, e);
      }
    }
    return decryptedPayloads;
  }

  /**
   * If an item was attempting to decrypt, but failed, either because the keys
   * for that item had not downloaded yet, or any other reason, it will be deferred
   * item.errorDecrypting = true and possibly item.waitingForKey = true.
   * Here we find such items, and attempt to decrypt them again.
   * @access public
   * @returns {void}
   */
  async decryptErroredItems() {
    const items = this.modelManager.allItems.filter((item) => {
      return item.waitingForKey || item.errorDecrypting;
    });
    if (items.length === 0) {
      return;
    }
    const payloads = items.map((item) => {
      return item.payloadRepresentation();
    });
    const decrypted = await this.payloadsByDecryptingPayloads({
      payloads
    });
    await this.modelManager.mapPayloadsToLocalItems({
      payloads: decrypted,
      source: PayloadSources.LocalChanged
    });
  }

  /**
   * Decrypts a backup file using user-inputted password
   * @access public
   * @param {object} data
   * @param {object} data.keyParams|data.auth_params
   * @param {Array.<object>} data.items
   * @param {string} password - The raw user password associated with this backup file
   * @returns {Array.<Payload>}
   */
  async payloadsByDecryptingBackupFile({ data, password }) {
    const keyParams = data.keyParams || data.auth_params;
    const rawItems = data.items;
    const encryptedPayloads = rawItems.map((rawItem) => {
      return CreateSourcedPayloadFromObject({
        object: rawItem,
        source: PayloadSources.FileImport,
      });
    });
    let decryptedPayloads;
    if (keyParams) {
      const key = await this.computeRootKey({
        password: password,
        keyParams: keyParams
      });
      decryptedPayloads = await this.payloadsByDecryptingPayloads({
        payloads: encryptedPayloads,
        key: key
      });
    } else {
      decryptedPayloads = encryptedPayloads;
    }
    return decryptedPayloads;
  }

  /**
   * Creates a key params object from a raw object
   * @access public
   * @param {object} keyParams - The raw key params object to create a KeyParams object from
   * @returns {SNRootKeyParams}
   */
  createKeyParams(keyParams) {
    if (keyParams.isKeyParamsObject) {
      throw 'Attempting to create key params from non-raw value.';
    }
    /* 002 doesn't have version automatically, newer versions do. */
    if (!keyParams.version) {
      keyParams.version = ProtocolVersions.V002;
    }
    return CreateKeyParams(keyParams);
  }

  /**
   * Creates a JSON string representing the backup format of all items, or just subitems
   * if supplied.
   * @access public
   * @param {Array} [subItems]  An optional array of items to create backup of.
   *                       If not supplied, all items are backed up. 
   * @param {EncryptionIntent} [intent = FilePreferEncrypted]
   * @param {bool} returnIfEmpty Returns null if there are no items to make backup of.
   * @returns {string} JSON stringified representation of data, including keyParams.
   */
  async createBackupFile({ subItems, intent, returnIfEmpty } = {}) {
    const items = subItems || this.modelManager.allItems;
    if (returnIfEmpty && items.length === 0) {
      return null;
    }
    if (!intent) {
      intent = EncryptionIntents.FilePreferEncrypted;
    }
    const payloads = items.map((item) => {
      return CreateMaxPayloadFromAnyObject({ object: item });
    });
    const encryptedPayloads = await this.payloadsByEncryptingPayloads({
      payloads: payloads,
      intent: intent
    });
    const data = {
      items: encryptedPayloads
    };
    const keyParams = await this.keyManager.getRootKeyParams();
    if (keyParams && intent !== EncryptionIntents.FileDecrypted) {
      data.keyParams = keyParams.getPortableValue();
    }
    const prettyPrint = 2;
    return JSON.stringify(data, null, prettyPrint);
  }
}

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
  EncryptionIntents
} from '@Protocol';

export class SNProtocolService extends PureService {

  constructor({ modelManager, crypto }) {
    if (!modelManager) {
      throw 'Invalid ProtocolService construction.';
    }
    super();
    this.operators = [];
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

  async deinit() {
    this.keyObsUnsubscribe();
    return super.deinit();
  }

  getLatestVersion() {
    return ProtocolVersions.V004;
  }

  async getUserVersion() {
    const keyParams = await this.keyManager.getRootKeyParams();
    return keyParams && keyParams.version;
  }

  async upgradeAvailable() {
    return await this.getUserVersion() !== this.getLatestVersion();
  }

  supportsPasswordDerivationCost(cost) {
    // Some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS or WebCrypto,
    // if user has high password cost and is using browser that doesn't support WebCrypto,
    // we want to tell them that they can't login with this browser.
    if (cost > 5000) {
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
      ProtocolVersions.V001,
      ProtocolVersions.V002,
      ProtocolVersions.V003,
      ProtocolVersions.V004,
    ];
  }

  isVersionNewerThanLibraryVersion(version) {
    const libraryVersion = this.getLatestVersion();
    return parseInt(version) > parseInt(libraryVersion);
  }

  isProtocolVersionOutdated(version) {
    // YYYY-MM-DD
    const expirationDates = {};
    expirationDates[ProtocolVersions.V001] = Date.parse('2018-01-01');
    expirationDates[ProtocolVersions.V002] = Date.parse('2020-01-01');

    const date = expirationDates[version];
    if (!date) {
      // No expiration date, is active version
      return false;
    }
    const expired = new Date() > date;
    return expired;
  }

  costMinimumForVersion(version) {
    switch (version) {
      case ProtocolVersions.V001:
        return SNProtocolOperator001.pwCost();
      case ProtocolVersions.V002:
        return SNProtocolOperator002.pwCost();
      case ProtocolVersions.V003:
        return SNProtocolOperator003.pwCost();
      case ProtocolVersions.V004:
        return SNProtocolOperator004.kdfIterations();
      default:
        throw `Unable to find cost minimum for version ${version}`;
    }
  }

  versionForPayload(payload) {
    return payload.content.substring(0, ProtocolVersions.VersionLength);
  }

  createOperatorForLatestVersion() {
    return this.createOperatorForVersion(this.getLatestVersion());
  }

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

  operatorForVersion(version) {
    const operatorKey = version;
    let operator = this.operators[operatorKey];
    if (!operator) {
      operator = this.createOperatorForVersion(version);
      this.operators[operatorKey] = operator;
    }
    return operator;
  }

  defaultOperator() {
    return this.operatorForVersion(this.getLatestVersion());
  }

  async computeRootKey({ password, keyParams }) {
    const version = keyParams.version;
    const operator = this.operatorForVersion(version);
    return operator.computeRootKey({ password, keyParams });
  }

  async createRootKey({ identifier, password }) {
    const operator = this.defaultOperator();
    return operator.createRootKey({ identifier, password });
  }

  async getRootKeyParams() {
    return this.keyManager.getRootKeyParams();
  }

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
        throw `Unhandled decrypted case in protocolService.payloadContentFormatForIntent.`;
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
        throw `Unhandled encrypted case in protocolService.payloadContentFormatForIntent.`;
      }
    }
  }

  /**
   * Generates parameters for a payload that are typically encrypted, and used for syncing or saving locally.
   * Parameters are non-typed objects that can later by converted to objects.
   * @param key Optional. The key to use to encrypt the payload. Will be looked up if not supplied.
   * @returns A plain key/value object.
   */
  async payloadByEncryptingPayload({ payload, key, intent }) {
    if (payload.errorDecrypting) {
      return payload;
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
   * @param payload - The payload to decrypt.
   * @param key - Optional. The key to use to decrypt the payload. 
   *              If none is supplied, it will be automatically looked up.
   */
  async payloadByDecryptingPayload({ payload, key }) {
    if (!payload.content) {
      throw 'Attempting to decrypt payload that has no content.';
    }
    if (!payload.isPayload) {
      throw 'Attempting to decrypt non-payload.';
    }
    const format = payload.getFormat();
    if (format=== PayloadFormats.DecryptedBareObject) {
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
    const version = this.versionForPayload(payload);
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

  async payloadsByDecryptingPayloads({ payloads, throws }) {
    const decryptedPayloads = [];

    for (const encryptedPayload of payloads) {
      if (!encryptedPayload) {
        /** Keep in counts similar to out counts */
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
          payload: encryptedPayload
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
        if (throws) { throw e; }
        console.error("Error decrypting payload", encryptedPayload, e);
      }
    }

    return decryptedPayloads;
  }

  /**
   * If an item was attempting to decrypt, but failed, either because the keys
   * for that item had not downloaded yet, or any other reason, it will be deferred
   * item.errorDecrypting = true and possibly item.waitingForKey = true.
   * Here we find such items, and attempt to decrypt them again.
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
      payloads: decrypted
    });
  }

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

  async payloadsByDecryptingRawPayload({ rawPayload }) {
    const encryptedPayload = CreateSourcedPayloadFromObject({
      object: rawPayload
    });
    return this.payloadByDecryptingPayload({
      payload: encryptedPayload
    });
  }

  /**
   * Compares two keys for equality
   * @returns Boolean
  */
  async compareRootKeys(keyA, keyB) {
    return keyA.compare(keyB);
  }

  createKeyParams(keyParams) {
    if (keyParams.isKeyParamsObject) {
      throw 'Attempting to create key params from non-raw value.';
    }
    /* 002 doesn't have version automatically, newer versions do. */
    if(!keyParams.version) {
      keyParams.version = ProtocolVersions.V002;
    }
    return CreateKeyParams(keyParams);
  }

  /**
   * Creates a JSON string representing the backup format of all items, or just subitems
   * if supplied.
   * @param {Array} subItems  An optional array of items to create backup of.
   *                       If not supplied, all items are backed up. 
   * @param {bool} returnIfEmpty Returns null if there are no items to make backup of.
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

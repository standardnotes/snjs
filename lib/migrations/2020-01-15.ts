import { OrchestratorFill } from './../services/challenge_service';
import { PurePayload } from '@Payloads/pure_payload';
import { StorageValuesObject } from './../services/storage_service';
import { Migration } from '@Lib/migrations/migration';
import {
  isEnvironmentWebOrDesktop,
  isEnvironmentMobile,
  Challenge,
  ChallengeType,
  ChallengeReason,
  StorageKeys,
  RawStorageKeys,
  namespacedKey,
  ApplicationStages
} from '@Lib/index';
import { CopyPayload, CreateMaxPayloadFromAnyObject } from '@Payloads/index';
import { PayloadSource } from '@Payloads/sources';
import {
  Copy, isNullOrUndefined, objectToValueArray, jsonParseEmbeddedKeys
} from '@Lib/utils';
import { ProtocolVersions, EncryptionIntents, SNRootKey } from '@Protocol/index';
import { SNItemsKey, ContentType } from '@Models/index';
import { SNStorageService } from '@Services/index';
import { Uuid } from '@Lib/uuid';
import { ValueModesKeys } from '@Services/storage_service';
import { Session } from '@Services/api/session';
import { CreateItemFromPayload } from '../models';

const LegacyKeys = {
  WebPasscodeParamsKey: 'offlineParams',
  MobilePasscodeParamsKey: 'pc_params',
  AllAccountKeyParamsKey: 'auth_params',
  WebEncryptedStorageKey: 'encryptedStorage',
  MobileWrappedRootKeyKey: 'encrypted_account_keys',
  AllMigrations: 'migrations'
};

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  protected registerStageHandlers() {
    this.registerStageHandler(ApplicationStages.PreparingForLaunch_0, async () => {
      if (isEnvironmentWebOrDesktop(this.services.environment)) {
        return this.migrateStorageStructureForWebDesktop();
      } else if (isEnvironmentMobile(this.services.environment)) {
        return this.migrateStorageStructureForMobile();
      }
    });
    this.registerStageHandler(ApplicationStages.StorageDecrypted_09, async () => {
      await this.migrateArbitraryRawStorageToManagedStorageAllPlatforms();
      await this.migrateSessionStorage();
      await this.deleteLegacyStorageValues();
    });
    this.registerStageHandler(ApplicationStages.LoadingDatabase_11, async () => {
      await this.createDefaultItemsKeyForAllPlatforms();
      this.markDone();
    });
  }

  /**
   * Web
   * Migrates legacy storage structure into new managed format.
   * If encrypted storage exists, we need to first decrypt it with the passcode.
   * Then extract the account key from it. Then, encrypt storage with the
   * account key. Then encrypt the account key with the passcode and store it
   * within the new storage format.
   *
   * Generate note: We do not use the keychain if passcode is available.
   */
  private async migrateStorageStructureForWebDesktop() {
    const deviceInterface = this.services.deviceInterface;
    const newStorageRawStructure: StorageValuesObject = {
      [ValueModesKeys.Wrapped]: {},
      [ValueModesKeys.Unwrapped]: {},
      [ValueModesKeys.Nonwrapped]: {}
    };
    const rawAccountKeyParams = await deviceInterface.getJsonParsedStorageValue(
      LegacyKeys.AllAccountKeyParamsKey
    );
    /** Could be null if no account, or if account and storage is encrypted */
    if (rawAccountKeyParams) {
      newStorageRawStructure.nonwrapped[StorageKeys.RootKeyParams] = rawAccountKeyParams;
    }
    const encryptedStorage = await deviceInterface.getJsonParsedStorageValue(
      LegacyKeys.WebEncryptedStorageKey
    );
    if (encryptedStorage) {
      const encryptedStoragePayload = CreateMaxPayloadFromAnyObject(
        encryptedStorage
      );
      const passcodeResult = await this.webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(
        encryptedStoragePayload
      );
      const passcodeKey = passcodeResult.key;
      const decryptedStoragePayload = passcodeResult.decryptedStoragePayload;
      const passcodeParams = passcodeResult.keyParams;
      newStorageRawStructure.nonwrapped[
        StorageKeys.RootKeyWrapperKeyParams
      ] = passcodeParams.getPortableValue();
      const rawStorageValueStore = Copy(decryptedStoragePayload.contentObject.storage);
      const storageValueStore: Record<string, any> = jsonParseEmbeddedKeys(rawStorageValueStore);
      /** Store previously encrypted auth_params into new nonwrapped value key */

      newStorageRawStructure[ValueModesKeys.Nonwrapped][StorageKeys.RootKeyParams] 
        = storageValueStore[LegacyKeys.AllAccountKeyParamsKey];

      let keyToEncryptStorageWith = passcodeKey;
      /** Extract account key (mk, pw, ak) if it exists */
      const hasAccountKeys = !isNullOrUndefined(storageValueStore.mk);
      if (hasAccountKeys) {
        const { accountKey, wrappedKey } = await this.webDesktopHelperExtractAndWrapAccountKeysFromValueStore(
          passcodeKey,
          storageValueStore
        );
        keyToEncryptStorageWith = accountKey;
        newStorageRawStructure.nonwrapped[StorageKeys.WrappedRootKey] = wrappedKey;
      }
      /** Encrypt storage with proper key */
      newStorageRawStructure.wrapped = await this.webDesktopHelperEncryptStorage(
        keyToEncryptStorageWith,
        decryptedStoragePayload,
        storageValueStore
      );
    } else {
      /** 
       * No encrypted storage, take account keys out of raw storage 
       * and place them in the keychain. */
      const ak = await this.services.deviceInterface.getRawStorageValue('ak');
      const version = !isNullOrUndefined(ak)
        ? ProtocolVersions.V003
        : ProtocolVersions.V002;
      const accountKey = await SNRootKey.Create(
        {
          masterKey: await this.services.deviceInterface.getRawStorageValue('mk'),
          serverPassword: await this.services.deviceInterface.getRawStorageValue('pw'),
          dataAuthenticationKey: ak,
          version: version
        }
      );
      await this.services.deviceInterface.setKeychainValue(
        accountKey.getPersistableValue()
      );
    }

    /** Persist storage under new key and structure */
    await this.allPlatformHelperSetStorageStructure(newStorageRawStructure);
  }

  /**
   * Helper
   * All platforms
   */
  private async allPlatformHelperSetStorageStructure(rawStructure: StorageValuesObject) {
    const newStructure = SNStorageService.defaultValuesObject(
      rawStructure[ValueModesKeys.Wrapped],
      rawStructure[ValueModesKeys.Unwrapped],
      rawStructure[ValueModesKeys.Nonwrapped],
    );
    newStructure[ValueModesKeys.Unwrapped] = undefined;
    await this.services.deviceInterface.setRawStorageValue(
      namespacedKey(this.services.namespace, RawStorageKeys.StorageObject),
      JSON.stringify(newStructure)
    );
  }

  /**
   * Helper
   * Web/desktop only
   */
  async webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(encryptedPayload: PurePayload) {
    const rawPasscodeParams = await this.services.deviceInterface
      .getJsonParsedStorageValue(
        LegacyKeys.WebPasscodeParamsKey
      );
    const passcodeParams = this.services.protocolService
      .createKeyParams(rawPasscodeParams);
    /** Decrypt it with the passcode */
    let decryptedStoragePayload = CreateMaxPayloadFromAnyObject({ errorDecrypting: true });
    let passcodeKey: SNRootKey;
    const challenge = new Challenge([ChallengeType.LocalPasscode], ChallengeReason.Migration);
    while (decryptedStoragePayload.errorDecrypting) {
      const orchestratorFill: OrchestratorFill = {};
      const response = await this.requestChallengeResponse(challenge, false, orchestratorFill);
      const value = response.getValueForType(ChallengeType.LocalPasscode);
      const passcode = value.value as string;
      passcodeKey = await this.services.protocolService.computeRootKey(
        passcode,
        passcodeParams
      );
      decryptedStoragePayload = await this.services.protocolService
        .payloadByDecryptingPayload(
          encryptedPayload,
          passcodeKey
        );
      orchestratorFill.orchestrator!.setValidationStatus(
        value,
        !decryptedStoragePayload.errorDecrypting
      );
    }
    return {
      decryptedStoragePayload,
      key: passcodeKey!,
      keyParams: passcodeParams
    };
  }

  /**
   * Helper
   * Web/desktop only
   */
  private async webDesktopHelperExtractAndWrapAccountKeysFromValueStore(
    passcodeKey: SNRootKey, 
    storageValueStore: Record<string, any>
    ) {
    const version = storageValueStore.ak
      ? ProtocolVersions.V003
      : ProtocolVersions.V002;
    const accountKey = await SNRootKey.Create(
      {
        masterKey: storageValueStore.mk,
        serverPassword: storageValueStore.pw,
        dataAuthenticationKey: storageValueStore.ak,
        version: version
      }
    );
    delete storageValueStore.mk;
    delete storageValueStore.pw;
    delete storageValueStore.ak;

    const accountKeyPayload = CreateMaxPayloadFromAnyObject(
      accountKey
    );
    let encryptedAccountKey;
    if (passcodeKey) {
      /** Encrypt account key with passcode */
      encryptedAccountKey = await this.services.protocolService
        .payloadByEncryptingPayload(
          accountKeyPayload,
          EncryptionIntents.LocalStorageEncrypted,
          passcodeKey,
        );
    }
    return {
      accountKey: accountKey,
      wrappedKey: encryptedAccountKey
    };
  }

  /**
   * Helper
   * Web/desktop only
   * Encrypt storage with account key
   */
  async webDesktopHelperEncryptStorage(
    key: SNRootKey,
    decryptedStoragePayload: PurePayload,
    storageValueStore: Record<string, any>
  ) {
    const wrapped = await this.services.protocolService.
      payloadByEncryptingPayload(
        CopyPayload(
          decryptedStoragePayload,
          {
            content_type: ContentType.EncryptedStorage,
            content: storageValueStore,
          }
        ),
        EncryptionIntents.LocalStoragePreferEncrypted,
        key,
      );
    return wrapped;
  }

  /**
   * Mobile
   * On mobile legacy structure is mostly similar to new structure,
   * in that the account key is encrypted with the passcode. But mobile did
   * not have encrypted storage, so we simply need to transfer all existing
   * storage values into new managed structure.
   *
   * If no account but passcode only, the only thing we stored on mobile
   * previously was keys.offline.pw and keys.offline.timing in the keychain
   * that we compared against for valid decryption.
   * In the new version, we know a passcode is correct if it can decrypt storage.
   * As part of the migration, we’ll need to request the raw passcode from user,
   * compare it against the keychain offline.pw value, and if correct,
   * migrate storage to new structure, and encrypt with passcode key.
   * 
   * If account only, take the value in the keychain, and rename the values
   * (i.e mk > masterKey).
   * @access private
   */
  async migrateStorageStructureForMobile() {
    const wrappedAccountKey = await this.services.deviceInterface.getJsonParsedStorageValue(
      LegacyKeys.MobileWrappedRootKeyKey
    );
    const rawAccountKeyParams = await this.services.deviceInterface.getJsonParsedStorageValue(
      LegacyKeys.AllAccountKeyParamsKey
    );
    const rawPasscodeParams = await this.services.deviceInterface.getJsonParsedStorageValue(
      LegacyKeys.MobilePasscodeParamsKey
    );
    const rawStructure: StorageValuesObject = {
      [ValueModesKeys.Nonwrapped]: {
        [StorageKeys.WrappedRootKey]: wrappedAccountKey,
        [StorageKeys.RootKeyWrapperKeyParams]: rawPasscodeParams,
        [StorageKeys.RootKeyParams]: rawAccountKeyParams
      },
      [ValueModesKeys.Unwrapped]: {},
      [ValueModesKeys.Wrapped]: {},
    };
    const keychainValue = await this.services.deviceInterface.getKeychainValue();
    if (rawPasscodeParams) {
      const passcodeParams = this.services.protocolService
        .createKeyParams(rawPasscodeParams);
      const getPasscodeKey = async () => {
        /** Validate current passcode by comparing against keychain offline.pw value */
        const pwHash = keychainValue.offline.pw;
        let passcodeKey: SNRootKey;
        const challenge = new Challenge([ChallengeType.LocalPasscode], ChallengeReason.Migration);
        const orchestratorFill: OrchestratorFill = {};
        while (!passcodeKey! || passcodeKey!.serverPassword !== pwHash) {
          const response = await this.requestChallengeResponse(challenge, false, orchestratorFill);
          const value = response.getValueForType(ChallengeType.LocalPasscode);
          const passcode = value.value as string;
          passcodeKey = await this.services.protocolService.computeRootKey(
            passcode,
            passcodeParams
          );
          orchestratorFill.orchestrator!.setValidationStatus(
            value,
            passcodeKey.serverPassword === pwHash
          );
        }
        return passcodeKey!;
      };
      const timing = keychainValue.offline.timing;
      rawStructure[ValueModesKeys.Unwrapped]![StorageKeys.MobilePasscodeTiming] = timing;
      if (wrappedAccountKey) {
        /** 
         * Account key is encrypted with passcode. Inside, the accountKey is located inside
         * content.accountKeys. We want to unembed these values to main content, rename 
         * with proper property names, wrap again, and store in new rawStructure.
         */
        const passcodeKey = await getPasscodeKey();
        const unwrappedAccountKey = await this.services.protocolService.payloadByDecryptingPayload(
          CreateMaxPayloadFromAnyObject(wrappedAccountKey),
          passcodeKey
        );
        const accountKeyContent = unwrappedAccountKey.contentObject.accountKeys;
        const defaultVersion = !isNullOrUndefined(accountKeyContent.ak)
          ? ProtocolVersions.V003
          : ProtocolVersions.V002;
        const newAccountKey = CopyPayload(
          unwrappedAccountKey,
          {
            content: {
              masterKey: accountKeyContent.mk,
              serverPassword: accountKeyContent.pw,
              dataAuthenticationKey: accountKeyContent.ak,
              version: accountKeyContent.version || defaultVersion,
              accountKeys: null
            }
          }
        );
        const newWrappedAccountKey = await this.services.protocolService.payloadByEncryptingPayload(
          newAccountKey,
          EncryptionIntents.LocalStoragePreferEncrypted,
          passcodeKey,
        );
        rawStructure.nonwrapped[StorageKeys.WrappedRootKey] = newWrappedAccountKey;
        await this.services.deviceInterface.clearKeychainValue();
      } else if (!wrappedAccountKey) {
        /** Passcode only, no account */
        const passcodeKey = await getPasscodeKey();
        const payload = CreateMaxPayloadFromAnyObject(
          {
            uuid: await Uuid.GenerateUuid(),
            content: rawStructure.unwrapped,
            content_type: ContentType.EncryptedStorage
          }
        );
        /** Encrypt new storage.unwrapped structure with passcode */
        const wrapped = await this.services.protocolService.payloadByEncryptingPayload(
          payload,
          EncryptionIntents.LocalStoragePreferEncrypted,
          passcodeKey,
        );
        rawStructure.wrapped = wrapped;
        await this.services.deviceInterface.clearKeychainValue();
      }
    } else {
      /** No passcode, potentially account. Migrate keychain property keys. */
      const hasAccount = keychainValue && keychainValue.mk;
      if (hasAccount) {
        const defaultVersion = !isNullOrUndefined(keychainValue.ak)
          ? ProtocolVersions.V003
          : ProtocolVersions.V002;
        const accountKey = await SNRootKey.Create(
          {
            masterKey: keychainValue.mk,
            serverPassword: keychainValue.pw,
            dataAuthenticationKey: keychainValue.ak,
            version: keychainValue.version || defaultVersion
          }
        );
        await this.services.deviceInterface.setKeychainValue(
          accountKey.getPersistableValue()
        );
      }
    }

    /** Move encrypted account key into place where it is now expected */
    await this.allPlatformHelperSetStorageStructure(rawStructure);
  }

  /**
   * All platforms
   * Migrate all previously independently stored storage keys into new
   * managed approach. Also deletes any legacy values from raw storage.
   * @access private
   */
  async migrateArbitraryRawStorageToManagedStorageAllPlatforms() {
    const allKeyValues = await this.services.deviceInterface
      .getAllRawStorageKeyValues();
    const legacyKeys = objectToValueArray(LegacyKeys);
    const tryJsonParse = (value: any) => {
      try { return JSON.parse(value); }
      catch (e) { return value; }
    };
    const namespace = this.services.namespace;
    for (const keyValuePair of allKeyValues) {
      const key = keyValuePair.key;
      const value = keyValuePair.value;
      const isNameSpacedKey = namespace && namespace.length > 0 && key.startsWith(namespace);
      if (legacyKeys.includes(key) || isNameSpacedKey) {
        continue;
      }
      if (!isNullOrUndefined(value)) {
        /**
         * Raw values should always have been json stringified.
         * New values should always be objects/parsed.
         */
        const newValue = tryJsonParse(value);
        await this.services.storageService.setValue(key, newValue);
      }
    }
  }

  /**
   * All platforms
   * Deletes all StorageKeys and LegacyKeys from root raw storage.
   * @access private
   */
  async deleteLegacyStorageValues() {
    const miscKeys = [
      'mk',
      'ak',
      'jwt',
      'ephemeral',
      'cachedThemes',
    ];
    const managedKeys = [
      ...objectToValueArray(StorageKeys),
      ...objectToValueArray(LegacyKeys),
      ...miscKeys
    ];
    for (const key of managedKeys) {
      await this.services.deviceInterface.removeRawStorageValue(key);
    }
  }

  /**
   * All platforms
   * Migrate previously stored session string token into object
   * @access private
   */
  async migrateSessionStorage() {
    const LEGACY_SESSION_TOKEN_KEY = 'jwt';
    const currentToken = await this.services.storageService.getValue(
      LEGACY_SESSION_TOKEN_KEY
    );
    if (!currentToken) {
      return;
    }
    const session = new Session(currentToken);
    await this.services.storageService.setValue(StorageKeys.Session, session);
  }

  /**
   * All platforms
   * Create new default SNItemsKey from root key.
   * Otherwise, when data is loaded, we won't be able to decrypt it
   * without existence of an item key. This will mean that if this migration
   * is run on two different platforms for the same user, they will create
   * two new items keys. Which one they use to decrypt past items and encrypt
   * future items doesn't really matter.
   * @access private
   */
  async createDefaultItemsKeyForAllPlatforms() {
    const rootKey = await this.services.protocolService.getRootKey();
    if (rootKey) {
      const rootKeyParams = await this.services.protocolService.getRootKeyParams();
      const payload = CreateMaxPayloadFromAnyObject({
        content_type: ContentType.ItemsKey,
        content: {
          itemsKey: rootKey.masterKey,
          dataAuthenticationKey: rootKey.dataAuthenticationKey,
          version: rootKeyParams!.version
        }
      });
      const itemsKey = CreateItemFromPayload(payload) as SNItemsKey;
      await itemsKey.initUUID();
      await this.services.modelManager.emitPayload(
        itemsKey.payloadRepresentation(),
        PayloadSource.LocalChanged
      );
      await this.services.modelManager.setItemDirty(itemsKey);
    }
  }
}

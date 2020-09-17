import { JwtSession } from './../services/api/session';
import { ContentType } from './../models/content_types';
import { SNItemsKey } from './../models/app/items_key';
import { SNRootKey } from './../protocol/root_key';
import { EncryptionIntent } from './../protocol/intents';
import { ProtocolVersion } from './../protocol/versions';
import { ApplicationStage } from '@Lib/stages';
import { StorageKey, RawStorageKey, namespacedKey } from '@Lib/storage_keys';
import { Challenge, ChallengeType, ChallengeReason } from './../challenges';
import { FillItemContent } from '@Models/functions';
import { PurePayload } from '@Payloads/pure_payload';
import { StorageValuesObject, SNStorageService } from './../services/storage_service';
import { Migration } from '@Lib/migrations/migration';
import { CopyPayload, CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { PayloadSource } from '@Payloads/sources';
import {
  Copy, isNullOrUndefined, objectToValueArray, jsonParseEmbeddedKeys
} from '@Lib/utils';
import { Uuid } from '@Lib/uuid';
import { ValueModesKeys } from '@Services/storage_service';
import { Session } from '@Services/api/session';
import { CreateItemFromPayload } from '../models';
import { isEnvironmentWebOrDesktop, isEnvironmentMobile } from '@Lib/platforms';

const LegacyKeys = {
  WebPasscodeParamsKey: 'offlineParams',
  MobilePasscodeParamsKey: 'pc_params',
  AllAccountKeyParamsKey: 'auth_params',
  WebEncryptedStorageKey: 'encryptedStorage',
  MobileWrappedRootKeyKey: 'encrypted_account_keys',
  MobileBiometricsPrefs: 'biometrics_prefs',
  AllMigrations: 'migrations'
};

export class Migration20200115 extends Migration {

  static timestamp() {
    return (new Date('2020-01-15').getTime());
  }

  protected registerStageHandlers() {
    this.registerStageHandler(ApplicationStage.PreparingForLaunch_0, async () => {
      if (isEnvironmentWebOrDesktop(this.services.environment)) {
        await this.migrateStorageStructureForWebDesktop();
      } else if (isEnvironmentMobile(this.services.environment)) {
        await this.migrateStorageStructureForMobile();
      }
    });
    this.registerStageHandler(ApplicationStage.StorageDecrypted_09, async () => {
      await this.migrateArbitraryRawStorageToManagedStorageAllPlatforms();
      await this.migrateSessionStorage();
      await this.deleteLegacyStorageValues();
    });
    this.registerStageHandler(ApplicationStage.LoadingDatabase_11, async () => {
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
    const rawAccountKeyParams = await deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys.AllAccountKeyParamsKey
    );
    /** Could be null if no account, or if account and storage is encrypted */
    if (rawAccountKeyParams) {
      newStorageRawStructure.nonwrapped[StorageKey.RootKeyParams] = rawAccountKeyParams;
    }
    const encryptedStorage = await deviceInterface.getJsonParsedRawStorageValue(
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
      const decryptedStoragePayload = passcodeResult.decryptedStoragePayload!;
      const passcodeParams = passcodeResult.keyParams;
      newStorageRawStructure.nonwrapped[
        StorageKey.RootKeyWrapperKeyParams
      ] = passcodeParams.getPortableValue();
      const rawStorageValueStore = Copy(decryptedStoragePayload.contentObject.storage);
      const storageValueStore: Record<string, any> = jsonParseEmbeddedKeys(rawStorageValueStore);
      /** Store previously encrypted auth_params into new nonwrapped value key */

      newStorageRawStructure.nonwrapped[StorageKey.RootKeyParams]
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
        newStorageRawStructure.nonwrapped[StorageKey.WrappedRootKey] = wrappedKey;
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
        ? ProtocolVersion.V003
        : ProtocolVersion.V002;
      const accountKey = await SNRootKey.Create(
        {
          masterKey: await this.services.deviceInterface.getRawStorageValue('mk'),
          serverPassword: await this.services.deviceInterface.getRawStorageValue('pw'),
          dataAuthenticationKey: ak,
          version: version
        }
      );
      await this.services.deviceInterface.setNamespacedKeychainValue(
        accountKey.getPersistableValue(),
        this.services.identifier
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
      rawStructure.wrapped,
      rawStructure.unwrapped,
      rawStructure.nonwrapped,
    );
    newStructure[ValueModesKeys.Unwrapped] = undefined;
    await this.services.deviceInterface.setRawStorageValue(
      namespacedKey(this.services.identifier, RawStorageKey.StorageObject),
      JSON.stringify(newStructure)
    );
  }

  /**
   * Helper
   * Web/desktop only
   */
  private async webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(encryptedPayload: PurePayload) {
    const rawPasscodeParams = await this.services.deviceInterface
      .getJsonParsedRawStorageValue(
        LegacyKeys.WebPasscodeParamsKey
      );
    const passcodeParams = this.services.protocolService.createKeyParams(rawPasscodeParams);
    /** Decrypt it with the passcode */
    let decryptedStoragePayload: PurePayload | undefined;
    let errorDecrypting = true;
    let passcodeKey: SNRootKey;
    const challenge = new Challenge([ChallengeType.LocalPasscode], ChallengeReason.Migration);
    while (errorDecrypting) {
      const [value] = await this.services.challengeService
        .promptForChallengeResponseWithCustomValidation!(challenge);
      const passcode = value.value as string;
      passcodeKey = await this.services.protocolService.computeRootKey(
        passcode,
        passcodeParams
      );
      decryptedStoragePayload = await this.services.protocolService.payloadByDecryptingPayload(
        encryptedPayload,
        passcodeKey
      );
      errorDecrypting = decryptedStoragePayload.errorDecrypting!;
      this.services.challengeService.setValidationStatusForChallenge(
        challenge,
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
      ? ProtocolVersion.V003
      : ProtocolVersion.V002;
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
          EncryptionIntent.LocalStorageEncrypted,
          passcodeKey,
        );
    }
    return {
      accountKey: accountKey,
      wrappedKey: encryptedAccountKey?.ejected()
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
        EncryptionIntent.LocalStoragePreferEncrypted,
        key,
      );
    return wrapped.ejected();
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
    const wrappedAccountKey = await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys.MobileWrappedRootKeyKey
    );
    const rawAccountKeyParams = await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys.AllAccountKeyParamsKey
    );
    const rawPasscodeParams = await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys.MobilePasscodeParamsKey
    );
    const rawStructure: StorageValuesObject = {
      [ValueModesKeys.Nonwrapped]: {
        [StorageKey.WrappedRootKey]: wrappedAccountKey,
        [StorageKey.RootKeyWrapperKeyParams]: rawPasscodeParams,
        [StorageKey.RootKeyParams]: rawAccountKeyParams
      },
      [ValueModesKeys.Unwrapped]: {},
      [ValueModesKeys.Wrapped]: {},
    };
    const keychainValue = await this.services.deviceInterface.getRawKeychainValue();
    const biometricPrefs = await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys.MobileBiometricsPrefs
    );
    if (biometricPrefs) {
      rawStructure.nonwrapped![StorageKey.BiometricsState] = biometricPrefs.enabled;
      rawStructure.nonwrapped![StorageKey.MobileBiometricsTiming] = biometricPrefs.timing;
    }
    if (rawPasscodeParams) {
      const passcodeParams = this.services.protocolService.createKeyParams(rawPasscodeParams);
      const getPasscodeKey = async () => {
        /** Validate current passcode by comparing against keychain offline.pw value */
        const pwHash = keychainValue.offline.pw;
        let passcodeKey: SNRootKey;
        const challenge = new Challenge([ChallengeType.LocalPasscode], ChallengeReason.Migration);
        while (!passcodeKey! || passcodeKey!.serverPassword !== pwHash) {
          const [value] = await this.services.challengeService
            .promptForChallengeResponseWithCustomValidation!(challenge);
          const passcode = value.value as string;
          passcodeKey = await this.services.protocolService.computeRootKey(
            passcode,
            passcodeParams
          );
          this.services.challengeService.setValidationStatusForChallenge(
            challenge,
            value,
            passcodeKey.serverPassword === pwHash
          );
        }
        return passcodeKey!;
      };
      const timing = keychainValue.offline.timing;
      rawStructure.nonwrapped![StorageKey.MobilePasscodeTiming] = timing;
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
          ? ProtocolVersion.V003
          : ProtocolVersion.V002;
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
          EncryptionIntent.LocalStoragePreferEncrypted,
          passcodeKey,
        );
        rawStructure.nonwrapped[StorageKey.WrappedRootKey] = newWrappedAccountKey.ejected();
        await this.services.deviceInterface.clearRawKeychainValue();
      } else if (!wrappedAccountKey) {
        /** Passcode only, no account */
        const passcodeKey = await getPasscodeKey();
        const payload = CreateMaxPayloadFromAnyObject(
          {
            uuid: await Uuid.GenerateUuid(),
            content: FillItemContent(rawStructure.unwrapped!),
            content_type: ContentType.EncryptedStorage
          }
        );
        /** Encrypt new storage.unwrapped structure with passcode */
        const wrapped = await this.services.protocolService.payloadByEncryptingPayload(
          payload,
          EncryptionIntent.LocalStoragePreferEncrypted,
          passcodeKey,
        );
        rawStructure.wrapped = wrapped.ejected();
        await this.services.deviceInterface.clearRawKeychainValue();
      }
    } else {
      /** No passcode, potentially account. Migrate keychain property keys. */
      const hasAccount = keychainValue && keychainValue.mk;
      if (hasAccount) {
        const defaultVersion = !isNullOrUndefined(keychainValue.ak)
          ? ProtocolVersion.V003
          : ProtocolVersion.V002;
        const accountKey = await SNRootKey.Create(
          {
            masterKey: keychainValue.mk,
            serverPassword: keychainValue.pw,
            dataAuthenticationKey: keychainValue.ak,
            version: keychainValue.version || defaultVersion
          }
        );
        await this.services.deviceInterface.setNamespacedKeychainValue(
          accountKey.getPersistableValue(),
          this.services.identifier
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
    const applicationIdentifier = this.services.identifier;
    for (const keyValuePair of allKeyValues) {
      const key = keyValuePair.key;
      const value = keyValuePair.value;
      const isNameSpacedKey = applicationIdentifier && applicationIdentifier.length > 0 && key.startsWith(applicationIdentifier);
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
   * Deletes all StorageKey and LegacyKeys from root raw storage.
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
      ...objectToValueArray(StorageKey),
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
    const session = new JwtSession(currentToken);
    await this.services.storageService.setValue(StorageKey.Session, session);
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
        uuid: await Uuid.GenerateUuid(),
        content_type: ContentType.ItemsKey,
        content: FillItemContent({
          itemsKey: rootKey.masterKey,
          dataAuthenticationKey: rootKey.dataAuthenticationKey,
          version: rootKeyParams!.version
        }),
        dirty: true,
        dirtiedDate: new Date()
      });
      const itemsKey = CreateItemFromPayload(payload) as SNItemsKey;
      await this.services.itemManager.emitItemFromPayload(
        itemsKey.payloadRepresentation(),
        PayloadSource.LocalChanged
      );
    }
  }
}

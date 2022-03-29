import { StorageReader1_0_0 } from './readers/reader_1_0_0'
import { MigrationServices } from './types'
import { PreviousSnjsVersion2_0_0 } from '../version'
import { LegacyKeys1_0_0, NonwrappedStorageKey } from '../Services/Storage/storage_keys'
import { JwtSession } from '../Services/Session/Sessions/JwtSession'
import { ContentType } from '@standardnotes/common'
import { SNItemsKey } from '../Models/ItemsKey/ItemsKey'
import { RootKeyContent, SNRootKey } from '../Protocol/root_key'
import { ProtocolVersion } from '@standardnotes/common'
import { ApplicationStage, EncryptionIntent } from '@standardnotes/applications'
import { RawStorageKey, StorageKey, namespacedKey } from '@Lib/Services/Storage/storage_keys'
import {
  PurePayload,
  CopyPayload,
  CreateMaxPayloadFromAnyObject,
  PayloadSource,
  CollectionSort,
  FillItemContent,
} from '@standardnotes/payloads'
import { SNStorageService, StorageValuesObject } from '../Services/Storage/StorageService'
import { Migration } from '@Lib/Migrations/migration'
import {
  Copy,
  isNullOrUndefined,
  jsonParseEmbeddedKeys,
  objectToValueArray,
  omitByCopy,
  UuidGenerator,
} from '@standardnotes/utils'
import { ValueModesKeys } from '@Lib/Services/Storage/StorageService'
import { CreateItemFromPayload } from '../Models'
import { isEnvironmentMobile, isEnvironmentWebOrDesktop } from '@Lib/Application/platforms'

type LegacyMobileKeychainStructure =
  | {
      offline?: {
        timing?: any
        pw?: string
      }
      encryptedAccountKeys?: any
      mk: string
      pw: string
      ak: string
      version?: string
      jwt?: string
    }
  | undefined
  | null
const LEGACY_SESSION_TOKEN_KEY = 'jwt'

export class Migration2_0_0 extends Migration {
  private legacyReader!: StorageReader1_0_0

  constructor(services: MigrationServices) {
    super(services)
    this.legacyReader = new StorageReader1_0_0(
      this.services.deviceInterface,
      this.services.identifier,
      this.services.environment,
    )
  }

  static version() {
    return PreviousSnjsVersion2_0_0
  }

  protected registerStageHandlers() {
    this.registerStageHandler(ApplicationStage.PreparingForLaunch_0, async () => {
      if (isEnvironmentWebOrDesktop(this.services.environment)) {
        await this.migrateStorageStructureForWebDesktop()
      } else if (isEnvironmentMobile(this.services.environment)) {
        await this.migrateStorageStructureForMobile()
      }
    })
    this.registerStageHandler(ApplicationStage.StorageDecrypted_09, async () => {
      await this.migrateArbitraryRawStorageToManagedStorageAllPlatforms()
      if (isEnvironmentMobile(this.services.environment)) {
        await this.migrateMobilePreferences()
      }
      await this.migrateSessionStorage()
      await this.deleteLegacyStorageValues()
    })
    this.registerStageHandler(ApplicationStage.LoadingDatabase_11, async () => {
      await this.createDefaultItemsKeyForAllPlatforms()
      this.markDone()
    })
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
    const deviceInterface = this.services.deviceInterface
    const newStorageRawStructure: StorageValuesObject = {
      [ValueModesKeys.Wrapped]: {},
      [ValueModesKeys.Unwrapped]: {},
      [ValueModesKeys.Nonwrapped]: {},
    }
    const rawAccountKeyParams = await this.legacyReader.getAccountKeyParams()
    /** Could be null if no account, or if account and storage is encrypted */
    if (rawAccountKeyParams) {
      newStorageRawStructure.nonwrapped[StorageKey.RootKeyParams] = rawAccountKeyParams
    }
    const encryptedStorage = await deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys1_0_0.WebEncryptedStorageKey,
    )
    if (encryptedStorage) {
      const encryptedStoragePayload = CreateMaxPayloadFromAnyObject(encryptedStorage as any)
      const passcodeResult = await this.webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(
        encryptedStoragePayload,
      )
      const passcodeKey = passcodeResult.key
      const decryptedStoragePayload = passcodeResult.decryptedStoragePayload!
      const passcodeParams = passcodeResult.keyParams
      newStorageRawStructure.nonwrapped[StorageKey.RootKeyWrapperKeyParams] =
        passcodeParams.getPortableValue()
      const rawStorageValueStore = Copy(decryptedStoragePayload.contentObject.storage)
      const storageValueStore: Record<string, any> = jsonParseEmbeddedKeys(rawStorageValueStore)
      /** Store previously encrypted auth_params into new nonwrapped value key */

      const accountKeyParams = storageValueStore[LegacyKeys1_0_0.AllAccountKeyParamsKey]
      newStorageRawStructure.nonwrapped[StorageKey.RootKeyParams] = accountKeyParams

      let keyToEncryptStorageWith = passcodeKey
      /** Extract account key (mk, pw, ak) if it exists */
      const hasAccountKeys = !isNullOrUndefined(storageValueStore.mk)
      if (hasAccountKeys) {
        const { accountKey, wrappedKey } =
          await this.webDesktopHelperExtractAndWrapAccountKeysFromValueStore(
            passcodeKey,
            accountKeyParams,
            storageValueStore,
          )
        keyToEncryptStorageWith = accountKey
        newStorageRawStructure.nonwrapped[StorageKey.WrappedRootKey] = wrappedKey
      }
      /** Encrypt storage with proper key */
      newStorageRawStructure.wrapped = await this.webDesktopHelperEncryptStorage(
        keyToEncryptStorageWith,
        decryptedStoragePayload,
        storageValueStore,
      )
    } else {
      /**
       * No encrypted storage, take account keys (if they exist) out of raw storage
       * and place them in the keychain. */
      const ak = await this.services.deviceInterface.getRawStorageValue('ak')
      const mk = await this.services.deviceInterface.getRawStorageValue('mk')
      if (ak || mk) {
        const version =
          (rawAccountKeyParams as any)?.version || (await this.getFallbackRootKeyVersion())
        const accountKey = await SNRootKey.Create({
          masterKey: mk!,
          dataAuthenticationKey: ak!,
          version: version,
          keyParams: rawAccountKeyParams as any,
        })
        await this.services.deviceInterface.setNamespacedKeychainValue(
          accountKey.getKeychainValue(),
          this.services.identifier,
        )
      }
    }

    /** Persist storage under new key and structure */
    await this.allPlatformHelperSetStorageStructure(newStorageRawStructure)
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
    )
    newStructure[ValueModesKeys.Unwrapped] = undefined
    await this.services.deviceInterface.setRawStorageValue(
      namespacedKey(this.services.identifier, RawStorageKey.StorageObject),
      JSON.stringify(newStructure),
    )
  }

  /**
   * Helper
   * Web/desktop only
   */
  private async webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage(
    encryptedPayload: PurePayload,
  ) {
    const rawPasscodeParams = await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys1_0_0.WebPasscodeParamsKey,
    )
    const passcodeParams = this.services.protocolService.createKeyParams(rawPasscodeParams as any)
    /** Decrypt it with the passcode */
    let decryptedStoragePayload: PurePayload | undefined
    let passcodeKey: SNRootKey

    await this.promptForPasscodeUntilCorrect(async (candidate: string) => {
      passcodeKey = await this.services.protocolService.computeRootKey(candidate, passcodeParams)
      decryptedStoragePayload =
        await this.services.protocolService.rootKeyEncryption.decryptPayload(
          encryptedPayload,
          passcodeKey,
        )
      return !decryptedStoragePayload.errorDecrypting!
    })

    return {
      decryptedStoragePayload,
      key: passcodeKey!,
      keyParams: passcodeParams,
    }
  }

  /**
   * Helper
   * Web/desktop only
   */
  private async webDesktopHelperExtractAndWrapAccountKeysFromValueStore(
    passcodeKey: SNRootKey,
    accountKeyParams: any,
    storageValueStore: Record<string, any>,
  ) {
    const version = accountKeyParams?.version || (await this.getFallbackRootKeyVersion())
    const accountKey = await SNRootKey.Create({
      masterKey: storageValueStore.mk,
      dataAuthenticationKey: storageValueStore.ak,
      version: version,
      keyParams: accountKeyParams,
    })
    delete storageValueStore.mk
    delete storageValueStore.pw
    delete storageValueStore.ak
    const accountKeyPayload = CreateMaxPayloadFromAnyObject(accountKey)
    let encryptedAccountKey
    if (passcodeKey) {
      /** Encrypt account key with passcode */
      encryptedAccountKey = await this.services.protocolService.rootKeyEncryption.encryptPayload(
        accountKeyPayload,
        EncryptionIntent.LocalStorageEncrypted,
        passcodeKey,
      )
    }
    return {
      accountKey: accountKey,
      wrappedKey: encryptedAccountKey?.ejected(),
    }
  }

  /**
   * Helper
   * Web/desktop only
   * Encrypt storage with account key
   */
  async webDesktopHelperEncryptStorage(
    key: SNRootKey,
    decryptedStoragePayload: PurePayload,
    storageValueStore: Record<string, any>,
  ) {
    const wrapped = await this.services.protocolService.rootKeyEncryption.encryptPayload(
      CopyPayload(decryptedStoragePayload, {
        content_type: ContentType.EncryptedStorage,
        content: storageValueStore,
      }),
      EncryptionIntent.LocalStorageEncrypted,
      key,
    )
    return wrapped.ejected()
  }

  /**
   * Mobile
   * On mobile legacy structure is mostly similar to new structure,
   * in that the account key is encrypted with the passcode. But mobile did
   * not have encrypted storage, so we simply need to transfer all existing
   * storage values into new managed structure.
   *
   * In version <= 3.0.16 on mobile, encrypted account keys were stored in the keychain
   * under `encryptedAccountKeys`. In 3.0.17 a migration was introduced that moved this value
   * to storage under key `encrypted_account_keys`. We need to anticipate the keys being in
   * either location.
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
    const keychainValue =
      (await this.services.deviceInterface.getRawKeychainValue()) as LegacyMobileKeychainStructure
    const wrappedAccountKey =
      (await this.services.deviceInterface.getJsonParsedRawStorageValue(
        LegacyKeys1_0_0.MobileWrappedRootKeyKey,
      )) || keychainValue?.encryptedAccountKeys
    const rawAccountKeyParams = (await this.legacyReader.getAccountKeyParams()) as any
    const rawPasscodeParams = await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys1_0_0.MobilePasscodeParamsKey,
    )
    const firstRunValue = await this.services.deviceInterface.getJsonParsedRawStorageValue(
      NonwrappedStorageKey.MobileFirstRun,
    )
    const rawStructure: StorageValuesObject = {
      [ValueModesKeys.Nonwrapped]: {
        [StorageKey.WrappedRootKey]: wrappedAccountKey,
        /** A 'hash' key may be present from legacy versions that should be deleted */
        [StorageKey.RootKeyWrapperKeyParams]: omitByCopy(rawPasscodeParams as any, ['hash']),
        [StorageKey.RootKeyParams]: rawAccountKeyParams,
        [NonwrappedStorageKey.MobileFirstRun]: firstRunValue,
      },
      [ValueModesKeys.Unwrapped]: {},
      [ValueModesKeys.Wrapped]: {},
    }
    const biometricPrefs = (await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys1_0_0.MobileBiometricsPrefs,
    )) as any
    if (biometricPrefs) {
      rawStructure.nonwrapped![StorageKey.BiometricsState] = biometricPrefs.enabled
      rawStructure.nonwrapped![StorageKey.MobileBiometricsTiming] = biometricPrefs.timing
    }
    const passcodeKeyboardType = await this.services.deviceInterface.getRawStorageValue(
      LegacyKeys1_0_0.MobilePasscodeKeyboardType,
    )
    if (passcodeKeyboardType) {
      rawStructure.nonwrapped![StorageKey.MobilePasscodeKeyboardType] = passcodeKeyboardType
    }
    if (rawPasscodeParams) {
      const passcodeParams = this.services.protocolService.createKeyParams(rawPasscodeParams as any)
      const getPasscodeKey = async () => {
        let passcodeKey: SNRootKey
        await this.promptForPasscodeUntilCorrect(async (candidate: string) => {
          passcodeKey = await this.services.protocolService.computeRootKey(
            candidate,
            passcodeParams,
          )
          const pwHash = keychainValue?.offline?.pw
          if (pwHash) {
            return passcodeKey.serverPassword === pwHash
          } else {
            /** Fallback decryption if keychain is missing for some reason. If account,
             * validate by attempting to decrypt wrapped account key. Otherwise, validate
             * by attempting to decrypt random item. */
            if (wrappedAccountKey) {
              const decryptedAcctKey =
                await this.services.protocolService.rootKeyEncryption.decryptPayload(
                  CreateMaxPayloadFromAnyObject(wrappedAccountKey as any),
                  passcodeKey,
                )
              return !decryptedAcctKey.errorDecrypting
            } else {
              const item = (
                await this.services.deviceInterface.getAllRawDatabasePayloads(
                  this.services.identifier,
                )
              )[0] as any

              if (!item) {
                throw Error('Passcode only migration aborting due to missing keychain.offline.pw')
              }

              const decryptedItem =
                await this.services.protocolService.rootKeyEncryption.decryptPayload(
                  CreateMaxPayloadFromAnyObject(item),
                  passcodeKey,
                )
              return !decryptedItem.errorDecrypting
            }
          }
        })
        return passcodeKey!
      }
      rawStructure.nonwrapped![StorageKey.MobilePasscodeTiming] = keychainValue?.offline?.timing
      if (wrappedAccountKey) {
        /**
         * Account key is encrypted with passcode. Inside, the accountKey is located inside
         * content.accountKeys. We want to unembed these values to main content, rename
         * with proper property names, wrap again, and store in new rawStructure.
         */
        const passcodeKey = await getPasscodeKey()
        const unwrappedAccountKey =
          await this.services.protocolService.rootKeyEncryption.decryptPayload(
            CreateMaxPayloadFromAnyObject(wrappedAccountKey as any),
            passcodeKey,
          )
        const accountKeyContent = unwrappedAccountKey.contentObject.accountKeys
        const version =
          accountKeyContent.version ||
          rawAccountKeyParams?.version ||
          (await this.getFallbackRootKeyVersion())
        const newAccountKey = CopyPayload(unwrappedAccountKey, {
          content: {
            masterKey: accountKeyContent.mk,
            dataAuthenticationKey: accountKeyContent.ak,
            version: version,
            keyParams: rawAccountKeyParams as any,
            accountKeys: undefined,
          } as RootKeyContent,
        })
        const newWrappedAccountKey =
          await this.services.protocolService.rootKeyEncryption.encryptPayload(
            newAccountKey,
            EncryptionIntent.LocalStorageEncrypted,
            passcodeKey,
          )
        rawStructure.nonwrapped[StorageKey.WrappedRootKey] = newWrappedAccountKey.ejected()
        if (accountKeyContent.jwt) {
          /** Move the jwt to raw storage so that it can be migrated in `migrateSessionStorage` */
          void this.services.deviceInterface.setRawStorageValue(
            LEGACY_SESSION_TOKEN_KEY,
            accountKeyContent.jwt,
          )
        }
        await this.services.deviceInterface.clearRawKeychainValue()
      } else if (!wrappedAccountKey) {
        /** Passcode only, no account */
        const passcodeKey = await getPasscodeKey()
        const payload = CreateMaxPayloadFromAnyObject({
          uuid: UuidGenerator.GenerateUuid(),
          content: FillItemContent(rawStructure.unwrapped!),
          content_type: ContentType.EncryptedStorage,
        })
        /** Encrypt new storage.unwrapped structure with passcode */
        const wrapped = await this.services.protocolService.rootKeyEncryption.encryptPayload(
          payload,
          EncryptionIntent.LocalStorageEncrypted,
          passcodeKey,
        )
        rawStructure.wrapped = wrapped.ejected()
        await this.services.deviceInterface.clearRawKeychainValue()
      }
    } else {
      /** No passcode, potentially account. Migrate keychain property keys. */
      const hasAccount = !isNullOrUndefined(keychainValue?.mk)
      if (hasAccount) {
        const accountVersion =
          (keychainValue!.version as ProtocolVersion) ||
          rawAccountKeyParams?.version ||
          (await this.getFallbackRootKeyVersion())
        const accountKey = await SNRootKey.Create({
          masterKey: keychainValue!.mk,
          dataAuthenticationKey: keychainValue!.ak,
          version: accountVersion,
          keyParams: rawAccountKeyParams as any,
        })
        await this.services.deviceInterface.setNamespacedKeychainValue(
          accountKey.getKeychainValue(),
          this.services.identifier,
        )
        if (keychainValue!.jwt) {
          /** Move the jwt to raw storage so that it can be migrated in `migrateSessionStorage` */
          this.services.deviceInterface.setRawStorageValue(
            LEGACY_SESSION_TOKEN_KEY,
            keychainValue!.jwt,
          )
        }
      }
    }

    /** Move encrypted account key into place where it is now expected */
    await this.allPlatformHelperSetStorageStructure(rawStructure)
  }

  /**
   * If we are unable to determine a root key's version, due to missing version
   * parameter from key params due to 001 or 002, we need to fallback to checking
   * any encrypted payload and retrieving its version.
   *
   * If we are unable to garner any meaningful information, we will default to 002.
   *
   * (Previously we attempted to discern version based on presence of keys.ak; if ak,
   * then 003, otherwise 002. However, late versions of 002 also inluded an ak, so this
   * method can't be used. This method also didn't account for 001 versions.)
   */
  private async getFallbackRootKeyVersion() {
    const anyItem = (
      await this.services.deviceInterface.getAllRawDatabasePayloads(this.services.identifier)
    )[0] as any
    if (!anyItem) {
      return ProtocolVersion.V002
    }
    const payload = CreateMaxPayloadFromAnyObject(anyItem)
    return payload.version || ProtocolVersion.V002
  }

  /**
   * All platforms
   * Migrate all previously independently stored storage keys into new
   * managed approach.
   */
  private async migrateArbitraryRawStorageToManagedStorageAllPlatforms() {
    const allKeyValues = await this.services.deviceInterface.getAllRawStorageKeyValues()
    const legacyKeys = objectToValueArray(LegacyKeys1_0_0)
    const tryJsonParse = (value: any) => {
      try {
        return JSON.parse(value)
      } catch (e) {
        return value
      }
    }
    const applicationIdentifier = this.services.identifier
    for (const keyValuePair of allKeyValues) {
      const key = keyValuePair.key
      const value = keyValuePair.value
      const isNameSpacedKey =
        applicationIdentifier &&
        applicationIdentifier.length > 0 &&
        key.startsWith(applicationIdentifier)
      if (legacyKeys.includes(key) || isNameSpacedKey) {
        continue
      }
      if (!isNullOrUndefined(value)) {
        /**
         * Raw values should always have been json stringified.
         * New values should always be objects/parsed.
         */
        const newValue = tryJsonParse(value)
        await this.services.storageService.setValue(key, newValue)
      }
    }
  }

  /**
   * All platforms
   * Deletes all StorageKey and LegacyKeys1_0_0 from root raw storage.
   * @access private
   */
  async deleteLegacyStorageValues() {
    const miscKeys = [
      'mk',
      'ak',
      'pw',
      'encryptionKey' /** v1 unused key */,
      'authKey' /** v1 unused key */,
      'jwt',
      'ephemeral',
      'cachedThemes',
    ]
    const managedKeys = [
      ...objectToValueArray(StorageKey),
      ...objectToValueArray(LegacyKeys1_0_0),
      ...miscKeys,
    ]
    for (const key of managedKeys) {
      await this.services.deviceInterface.removeRawStorageValue(key)
    }
  }

  /**
   * Mobile
   * Migrate mobile preferences
   */
  private async migrateMobilePreferences() {
    const lastExportDate = await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys1_0_0.MobileLastExportDate,
    )
    const doNotWarnUnsupportedEditors =
      await this.services.deviceInterface.getJsonParsedRawStorageValue(
        LegacyKeys1_0_0.MobileDoNotWarnUnsupportedEditors,
      )
    const legacyOptionsState = (await this.services.deviceInterface.getJsonParsedRawStorageValue(
      LegacyKeys1_0_0.MobileOptionsState,
    )) as any
    let migratedOptionsState = {}
    if (legacyOptionsState) {
      const legacySortBy = legacyOptionsState.sortBy
      migratedOptionsState = {
        sortBy:
          legacySortBy === 'updated_at' || legacySortBy === 'client_updated_at'
            ? CollectionSort.UpdatedAt
            : legacySortBy,
        sortReverse: legacyOptionsState.sortReverse ?? false,
        hideNotePreview: legacyOptionsState.hidePreviews ?? false,
        hideDate: legacyOptionsState.hideDates ?? false,
        hideTags: legacyOptionsState.hideTags ?? false,
      }
    }
    const preferences = {
      ...migratedOptionsState,
      lastExportDate: lastExportDate ?? undefined,
      doNotShowAgainUnsupportedEditors: doNotWarnUnsupportedEditors ?? false,
    }
    await this.services.storageService.setValue(StorageKey.MobilePreferences, preferences)
  }

  /**
   * All platforms
   * Migrate previously stored session string token into object
   * On mobile, JWTs were previously stored in storage, inside of the user object,
   * but then custom-migrated to be stored in the keychain. We must account for
   * both scenarios here in case a user did not perform the custom platform migration.
   * On desktop/web, JWT was stored in storage.
   */
  private async migrateSessionStorage() {
    const USER_OBJECT_KEY = 'user'
    let currentToken = await this.services.storageService.getValue(LEGACY_SESSION_TOKEN_KEY)
    const user = await this.services.storageService.getValue(USER_OBJECT_KEY)
    if (!currentToken) {
      /** Try the user object */
      if (user) {
        currentToken = user.jwt
      }
    }
    if (!currentToken) {
      /**
       * If we detect that a user object is present, but the jwt is missing,
       * we'll fill the jwt value with a junk value just so we create a session.
       * When the client attempts to talk to the server, the server will reply
       * with invalid token error, and the client will automatically prompt to reauthenticate.
       */
      const hasAccount = !isNullOrUndefined(user)
      if (hasAccount) {
        currentToken = 'junk-value'
      } else {
        return
      }
    }
    const session = new JwtSession(currentToken)
    await this.services.storageService.setValue(StorageKey.Session, session)
    /** Server has to be migrated separately on mobile */
    if (isEnvironmentMobile(this.services.environment)) {
      const user = await this.services.storageService.getValue(USER_OBJECT_KEY)
      if (user && user.server) {
        await this.services.storageService.setValue(StorageKey.ServerHost, user.server)
      }
    }
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
    const rootKey = this.services.protocolService.getRootKey()
    if (rootKey) {
      const rootKeyParams = await this.services.protocolService.getRootKeyParams()
      /** If params are missing a version, it must be 001 */
      const fallbackVersion = ProtocolVersion.V001
      const payload = CreateMaxPayloadFromAnyObject({
        uuid: await UuidGenerator.GenerateUuid(),
        content_type: ContentType.ItemsKey,
        content: FillItemContent({
          itemsKey: rootKey.masterKey,
          dataAuthenticationKey: rootKey.dataAuthenticationKey,
          version: rootKeyParams!.version || fallbackVersion,
        }),
        dirty: true,
        dirtiedDate: new Date(),
      })
      const itemsKey = CreateItemFromPayload(payload) as SNItemsKey
      await this.services.itemManager.emitItemFromPayload(
        itemsKey.payloadRepresentation(),
        PayloadSource.LocalChanged,
      )
    }
  }
}

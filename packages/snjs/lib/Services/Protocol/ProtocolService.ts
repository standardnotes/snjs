import {
  createKeyLookupSplitFromSplit,
  EncryptionSplitWithKey,
  findPayloadInSplit,
  splitItemsByEncryptionType,
} from './EncryptionSplit'
import { RootKeyEncryptionService, RootKeyServiceEvent } from './RootKeyEncryption'
import {
  ItemAuthenticatedData,
  LegacyAttachedData,
  RootKeyEncryptedAuthenticatedData,
  PurePayload,
  PayloadFormat,
  CreateIntentPayloadFromObject,
  EncryptedParameters,
  DecryptedParameters,
  ErroredDecryptingParameters,
  mergePayloadWithEncryptionParameters,
} from '@standardnotes/payloads'
import { Uuids } from '@Lib/Models/Functions'
import { ItemManager } from '@Lib/Services/Items/ItemManager'
import { SyncEvent } from '@Lib/Application/events'
import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { CreateAnyKeyParams, SNRootKeyParams } from '../../Protocol/key_params'
import { SNStorageService } from '../Storage/StorageService'
import { SNRootKey } from '@Lib/Protocol/root_key'
import { PayloadManager } from '../Payloads/PayloadManager'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import {
  extendArray,
  isNullOrUndefined,
  isReactNativeEnvironment,
  isWebCryptoAvailable,
  UuidGenerator,
} from '@standardnotes/utils'
import { V001Algorithm, V002Algorithm } from '../../Protocol/operator/algorithms'
import {
  ContentType,
  ProtocolVersion,
  KeyParamsOrigination,
  AnyKeyParamsContent,
  ProtocolVersionLatest,
  ProtocolVersionLastNonrootItemsKey,
} from '@standardnotes/common'
import {
  compareVersions,
  isVersionLessThanOrEqualTo,
  EncryptionIntent,
  ApplicationIdentifier,
} from '@standardnotes/applications'
import {
  AbstractService,
  DeviceInterface,
  InternalEventBusInterface,
} from '@standardnotes/services'
import { BackupFile } from './BackupFile'
import { KeyMode } from './KeyMode'
import { decryptBackupFile } from './BackupFileDecryptor'
import { OperatorManager } from './OperatorManager'
import { ItemsEncryptionService } from './ItemsEncryption'
import { findDefaultItemsKey } from './Functions'

export enum ProtocolServiceEvent {
  RootKeyStatusChanged = 'RootKeyStatusChanged',
}

/**
 * The protocol service is responsible for the encryption and decryption of payloads, and
 * handles delegation of a task to the respective protocol operator. Each version of the protocol
 * (001, 002, 003, 004, etc) uses a respective operator version to perform encryption operations.
 * Operators are located in /protocol/operator.
 * The protocol service depends on the keyManager for determining which key to use for the
 * encryption and decryption of a particular payload.
 * The protocol service is also responsible for dictating which protocol versions are valid,
 * and which are no longer valid or not supported.

 * The key manager is responsible for managing root key and root key wrapper states.
 * When the key manager is initialized, it initiates itself with a keyMode, which
 * dictates the entire flow of key management. The key manager's responsibilities include:
 * - interacting with the device keychain to save or clear the root key
 * - interacting with storage to save root key params or wrapper params, or the wrapped root key.
 * - exposing methods that allow the application to unwrap the root key (unlock the application)
 *
 * It also exposes two primary methods for determining what key should be used to encrypt
 * or decrypt a particular payload. Some payloads are encrypted directly with the rootKey
 * (such as itemsKeys and encryptedStorage). Others are encrypted with itemsKeys (notes, tags, etc).

 * The items key manager manages the lifecycle of items keys.
 * It is responsible for creating the default items key when conditions call for it
 * (such as after the first sync completes and no key exists).
 * It also exposes public methods that allows consumers to retrieve an items key
 * for a particular payload, and also retrieve all available items keys.
*/
export class SNProtocolService extends AbstractService<ProtocolServiceEvent> {
  private operatorManager: OperatorManager
  private readonly itemsEncryption: ItemsEncryptionService
  private readonly rootKeyEncryption: RootKeyEncryptionService
  private rootKeyObserverDisposer: () => void

  constructor(
    private itemManager: ItemManager,
    private payloadManager: PayloadManager,
    public deviceInterface: DeviceInterface,
    private storageService: SNStorageService,
    private identifier: ApplicationIdentifier,
    public crypto: SNPureCrypto,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
    this.crypto = crypto

    this.operatorManager = new OperatorManager(crypto)

    this.itemsEncryption = new ItemsEncryptionService(
      itemManager,
      payloadManager,
      storageService,
      this.operatorManager,
      internalEventBus,
    )

    this.rootKeyEncryption = new RootKeyEncryptionService(
      this.itemManager,
      this.operatorManager,
      this.deviceInterface,
      this.storageService,
      this.identifier,
      this.internalEventBus,
    )
    this.rootKeyObserverDisposer = this.rootKeyEncryption.addEventObserver((event) => {
      this.itemsEncryption.userVersion = this.getUserVersion()
      if (event === RootKeyServiceEvent.RootKeyStatusChanged) {
        void this.notifyEvent(ProtocolServiceEvent.RootKeyStatusChanged)
      }
    })

    UuidGenerator.SetGenerator(this.crypto.generateUUID)
  }

  /** @override */
  public deinit(): void {
    ;(this.itemManager as unknown) = undefined
    ;(this.payloadManager as unknown) = undefined
    ;(this.deviceInterface as unknown) = undefined
    ;(this.storageService as unknown) = undefined
    ;(this.crypto as unknown) = undefined
    ;(this.operatorManager as unknown) = undefined

    this.rootKeyObserverDisposer()
    ;(this.rootKeyObserverDisposer as unknown) = undefined

    this.itemsEncryption.deinit()
    ;(this.itemsEncryption as unknown) = undefined

    this.rootKeyEncryption.deinit()
    ;(this.rootKeyEncryption as unknown) = undefined

    super.deinit()
  }

  public async initialize() {
    await this.rootKeyEncryption.initialize()
  }

  /**
   * Returns encryption protocol display name for active account/wrapper
   */
  public async getEncryptionDisplayName() {
    const version = await this.rootKeyEncryption.getEncryptionSourceVersion()
    if (version) {
      return this.operatorManager.operatorForVersion(version).getEncryptionDisplayName()
    }
  }

  public getLatestVersion() {
    return ProtocolVersionLatest
  }

  public hasAccount() {
    return this.rootKeyEncryption.hasAccount()
  }

  public getUserVersion(): ProtocolVersion | undefined {
    return this.rootKeyEncryption.getUserVersion()
  }

  public async upgradeAvailable() {
    const accountUpgradeAvailable = await this.accountUpgradeAvailable()
    const passcodeUpgradeAvailable = await this.passcodeUpgradeAvailable()
    return accountUpgradeAvailable || passcodeUpgradeAvailable
  }

  async repersistAllItems(): Promise<void> {
    return this.itemsEncryption.repersistAllItems()
  }

  public async encryptSplit(
    split: EncryptionSplitWithKey<PurePayload>,
    intent: EncryptionIntent,
  ): Promise<PurePayload[]> {
    const allEncryptedParams: EncryptedParameters[] = []
    const allNonencryptablePayloads: PurePayload[] = []

    const categorizePayloads = (payloads: PurePayload[]) => {
      const encryptables: PurePayload[] = []
      const nonencryptables: PurePayload[] = []

      for (const payload of payloads) {
        if (payload.errorDecrypting || payload.deleted) {
          nonencryptables.push(payload)
        } else {
          encryptables.push(payload)
        }
      }

      return { encryptables, nonencryptables }
    }

    if (split.usesRootKey) {
      const categorized = categorizePayloads(split.usesRootKey.items)
      const rootKeyEncrypted = await this.rootKeyEncryption.encryptPayloads(
        categorized.encryptables,
        split.usesRootKey.key,
      )
      extendArray(allEncryptedParams, rootKeyEncrypted)
      extendArray(allNonencryptablePayloads, categorized.nonencryptables)
    }

    if (split.usesItemsKey) {
      const categorized = categorizePayloads(split.usesItemsKey.items)
      const itemsKeyEncrypted = await this.itemsEncryption.encryptPayloads(
        categorized.encryptables,
        split.usesItemsKey.key,
      )
      extendArray(allEncryptedParams, itemsKeyEncrypted)
      extendArray(allNonencryptablePayloads, categorized.nonencryptables)
    }

    if (split.usesRootKeyWithKeyLookup) {
      const categorized = categorizePayloads(split.usesRootKeyWithKeyLookup.items)
      const rootKeyEncrypted = await this.rootKeyEncryption.encryptPayloadsWithKeyLookup(
        categorized.encryptables,
      )
      extendArray(allEncryptedParams, rootKeyEncrypted)
      extendArray(allNonencryptablePayloads, categorized.nonencryptables)
    }

    if (split.usesItemsKeyWithKeyLookup) {
      const categorized = categorizePayloads(split.usesItemsKeyWithKeyLookup.items)
      const itemsKeyEncrypted = await this.itemsEncryption.encryptPayloadsWithKeyLookup(
        categorized.encryptables,
      )
      extendArray(allEncryptedParams, itemsKeyEncrypted)
      extendArray(allNonencryptablePayloads, categorized.nonencryptables)
    }

    const packagedEncrypted = allEncryptedParams.map((encryptedParams) =>
      CreateIntentPayloadFromObject(
        findPayloadInSplit(encryptedParams.uuid, split),
        intent,
        encryptedParams,
      ),
    )

    return allNonencryptablePayloads.concat(packagedEncrypted)
  }

  public async decryptSplit(split: EncryptionSplitWithKey<PurePayload>): Promise<PurePayload[]> {
    const allDecryptedParams: (DecryptedParameters | ErroredDecryptingParameters)[] = []
    const allNondecryptablePayloads: PurePayload[] = []

    const categorizePayloads = (payloads: PurePayload[]) => {
      const decryptables: PurePayload[] = []
      const nondecryptables: PurePayload[] = []

      for (const payload of payloads) {
        const isDeletedPendingSync = payload.deleted === true && payload.content === undefined
        const alreadyDecrypted = payload.format === PayloadFormat.DecryptedBareObject
        if (isDeletedPendingSync || alreadyDecrypted) {
          nondecryptables.push(payload)
        } else {
          decryptables.push(payload)
        }
      }

      return { decryptables, nondecryptables }
    }

    if (split.usesRootKey) {
      const categorized = categorizePayloads(split.usesRootKey.items)
      const rootKeyDecrypted = await this.rootKeyEncryption.decryptPayloads(
        categorized.decryptables,
        split.usesRootKey.key,
      )
      extendArray(allDecryptedParams, rootKeyDecrypted)
      extendArray(allNondecryptablePayloads, categorized.nondecryptables)
    }

    if (split.usesItemsKey) {
      const categorized = categorizePayloads(split.usesItemsKey.items)
      const itemsKeyDecrypted = await this.itemsEncryption.decryptPayloads(
        categorized.decryptables,
        split.usesItemsKey.key,
      )
      extendArray(allDecryptedParams, itemsKeyDecrypted)
      extendArray(allNondecryptablePayloads, categorized.nondecryptables)
    }

    const packagedDecrypted = allDecryptedParams.map((decryptedParams) =>
      mergePayloadWithEncryptionParameters(
        findPayloadInSplit(decryptedParams.uuid, split),
        decryptedParams,
      ),
    )

    return allNondecryptablePayloads.concat(packagedDecrypted)
  }

  /**
   * Returns true if the user's account protocol version is not equal to the latest version.
   */
  public accountUpgradeAvailable(): boolean {
    const userVersion = this.getUserVersion()
    if (!userVersion) {
      return false
    }
    return userVersion !== ProtocolVersionLatest
  }

  /**
   * Returns true if the user's account protocol version is not equal to the latest version.
   */
  public async passcodeUpgradeAvailable(): Promise<boolean> {
    return this.rootKeyEncryption.passcodeUpgradeAvailable()
  }

  /**
   * Determines whether the current environment is capable of supporting
   * key derivation.
   */
  public platformSupportsKeyDerivation(keyParams: SNRootKeyParams) {
    /**
     * If the version is 003 or lower, key derivation is supported unless the browser is
     * IE or Edge (or generally, where WebCrypto is not available) or React Native environment is detected.
     *
     * Versions 004 and above are always supported.
     */
    if (compareVersions(keyParams.version, ProtocolVersion.V004) >= 0) {
      /* keyParams.version >= 004 */
      return true
    } else {
      return !!isWebCryptoAvailable() || isReactNativeEnvironment()
    }
  }

  /**
   * @returns The versions that this library supports.
   */
  public supportedVersions() {
    return [ProtocolVersion.V001, ProtocolVersion.V002, ProtocolVersion.V003, ProtocolVersion.V004]
  }

  /**
   * Determines whether the input version is greater than the latest supported library version.
   */
  public isVersionNewerThanLibraryVersion(version: ProtocolVersion) {
    const libraryVersion = ProtocolVersionLatest
    return compareVersions(version, libraryVersion) === 1
  }

  /**
   * Versions 001 and 002 of the protocol supported dynamic costs, as reported by the server.
   * This function returns the client-enforced minimum cost, to prevent the server from
   * overwhelmingly under-reporting the cost.
   */
  public costMinimumForVersion(version: ProtocolVersion) {
    if (compareVersions(version, ProtocolVersion.V003) >= 0) {
      throw 'Cost minimums only apply to versions <= 002'
    }
    if (version === ProtocolVersion.V001) {
      return V001Algorithm.PbkdfMinCost
    } else if (version === ProtocolVersion.V002) {
      return V002Algorithm.PbkdfMinCost
    } else {
      throw `Invalid version for cost minimum: ${version}`
    }
  }

  /**
   * Computes a root key given a password and key params.
   * Delegates computation to respective protocol operator.
   */
  public async computeRootKey(password: string, keyParams: SNRootKeyParams) {
    return this.rootKeyEncryption.computeRootKey(password, keyParams)
  }

  /**
   * Creates a root key using the latest protocol version
   */
  public async createRootKey(
    identifier: string,
    password: string,
    origination: KeyParamsOrigination,
    version?: ProtocolVersion,
  ) {
    return this.rootKeyEncryption.createRootKey(identifier, password, origination, version)
  }

  /**
   * Decrypts a backup file using user-inputted password
   * @param password - The raw user password associated with this backup file
   */
  public async payloadsByDecryptingBackupFile(file: BackupFile, password?: string) {
    const result = await decryptBackupFile(file, this, password)
    return result
  }

  /**
   * Creates a key params object from a raw object
   * @param keyParams - The raw key params object to create a KeyParams object from
   */
  public createKeyParams(keyParams: AnyKeyParamsContent) {
    return CreateAnyKeyParams(keyParams)
  }

  public async createEncryptedBackupFile(): Promise<BackupFile> {
    const payloads = this.itemManager.items.map((item) => item.payload)
    const split = splitItemsByEncryptionType(payloads)
    const keyLookupSplit = createKeyLookupSplitFromSplit(split)
    const result = await this.encryptSplit(keyLookupSplit, EncryptionIntent.FileEncrypted)
    const ejected = result.map((payload) => payload.ejected())

    const data: BackupFile = {
      version: ProtocolVersionLatest,
      items: ejected,
    }

    const keyParams = await this.getRootKeyParams()
    data.keyParams = keyParams?.getPortableValue()
    return data
  }

  public createDecryptedBackupFile(): BackupFile {
    const items = this.itemManager.items.filter(
      (item) => item.content_type !== ContentType.ItemsKey,
    )

    const data: BackupFile = {
      version: ProtocolVersionLatest,
      items: items.map((item) => {
        return item.payload.ejected()
      }),
    }

    return data
  }

  public hasPasscode(): boolean {
    return this.rootKeyEncryption.hasPasscode()
  }

  /**
   * @returns True if the root key has not yet been unwrapped (passcode locked).
   */
  public async isPasscodeLocked() {
    return (
      (await this.rootKeyEncryption.hasRootKeyWrapper()) &&
      this.rootKeyEncryption.getRootKey() == undefined
    )
  }

  public async getRootKeyParams() {
    return this.rootKeyEncryption.getRootKeyParams()
  }

  public getAccountKeyParams() {
    return this.rootKeyEncryption.memoizedRootKeyParams
  }

  /**
   * Computes the root key wrapping key given a passcode.
   * Wrapping key params are read from disk.
   */
  public async computeWrappingKey(passcode: string) {
    const keyParams = await this.rootKeyEncryption.getSureRootKeyWrapperKeyParams()
    const key = await this.computeRootKey(passcode, keyParams)
    return key
  }

  /**
   * Unwraps the persisted root key value using the supplied wrappingKey.
   * Application interfaces must check to see if the root key requires unwrapping on load.
   * If so, they must generate the unwrapping key by getting our saved wrapping key keyParams.
   * After unwrapping, the root key is automatically loaded.
   */
  public async unwrapRootKey(wrappingKey: SNRootKey) {
    return this.rootKeyEncryption.unwrapRootKey(wrappingKey)
  }
  /**
   * Encrypts rootKey and saves it in storage instead of keychain, and then
   * clears keychain. This is because we don't want to store large encrypted
   * payloads in the keychain. If the root key is not wrapped, it is stored
   * in plain form in the user's secure keychain.
   */
  public async setNewRootKeyWrapper(wrappingKey: SNRootKey) {
    return this.rootKeyEncryption.setNewRootKeyWrapper(wrappingKey)
  }

  public async removePasscode(): Promise<void> {
    await this.rootKeyEncryption.removeRootKeyWrapper()
  }

  public async setRootKey(key: SNRootKey, wrappingKey?: SNRootKey) {
    await this.rootKeyEncryption.setRootKey(key, wrappingKey)
  }

  /**
   * Returns the in-memory root key value.
   */
  public getRootKey() {
    return this.rootKeyEncryption.getRootKey()
  }

  /**
   * Deletes root key and wrapper from keychain. Used when signing out of application.
   */
  public async clearLocalKeyState() {
    await this.rootKeyEncryption.clearLocalKeyState()
  }

  public async validateAccountPassword(password: string) {
    return this.rootKeyEncryption.validateAccountPassword(password)
  }

  public async validatePasscode(passcode: string) {
    return this.rootKeyEncryption.validatePasscode(passcode)
  }

  /** Returns the key params attached to this key's encrypted payload */
  public getEmbeddedPayloadAuthenticatedData(
    payload: PurePayload,
  ): RootKeyEncryptedAuthenticatedData | ItemAuthenticatedData | LegacyAttachedData | undefined {
    const version = payload.version
    if (!version) {
      return undefined
    }
    const operator = this.operatorManager.operatorForVersion(version)
    const authenticatedData = operator.getPayloadAuthenticatedData(payload)
    return authenticatedData
  }

  /** Returns the key params attached to this key's encrypted payload */
  public getKeyEmbeddedKeyParams(key: SNItemsKey): SNRootKeyParams | undefined {
    /** We can only look up key params for keys that are encrypted (as strings) */
    if (key.payload.format === PayloadFormat.DecryptedBareObject) {
      return undefined
    }
    const authenticatedData = this.getEmbeddedPayloadAuthenticatedData(key.payload)
    if (!authenticatedData) {
      return undefined
    }
    if (isVersionLessThanOrEqualTo(key.version, ProtocolVersion.V003)) {
      const rawKeyParams = authenticatedData as LegacyAttachedData
      return this.createKeyParams(rawKeyParams)
    } else {
      const rawKeyParams = (authenticatedData as RootKeyEncryptedAuthenticatedData).kp
      return this.createKeyParams(rawKeyParams)
    }
  }

  /**
   * A new rootkey-based items key is needed if a user changes their account password
   * on an 003 client and syncs on a signed in 004 client.
   */
  public needsNewRootKeyBasedItemsKey(): boolean {
    if (!this.hasAccount()) {
      return false
    }

    const rootKey = this.rootKeyEncryption.getRootKey()
    if (!rootKey) {
      return false
    }

    if (compareVersions(rootKey.keyVersion, ProtocolVersionLastNonrootItemsKey) > 0) {
      /** Is >= 004, not needed */
      return false
    }

    /**
     * A new root key based items key is needed if our default items key content
     * isnt equal to our current root key
     */
    const defaultItemsKey = findDefaultItemsKey(this.itemsEncryption.getItemsKeys())

    /** Shouldn't be undefined, but if it is, we'll take the corrective action */
    if (!defaultItemsKey) {
      return true
    }

    return defaultItemsKey.itemsKey !== rootKey.itemsKey
  }

  public async createNewDefaultItemsKey(): Promise<SNItemsKey> {
    return this.rootKeyEncryption.createNewDefaultItemsKey()
  }

  public getPasswordCreatedDate(): Date | undefined {
    const rootKey = this.getRootKey()
    return rootKey ? rootKey.keyParams.createdDate : undefined
  }

  public async onSyncEvent(eventName: SyncEvent) {
    if (eventName === SyncEvent.SyncCompletedWithAllItemsUploaded) {
      await this.handleFullSyncCompletion()
    }
    if (eventName === SyncEvent.DownloadFirstSyncCompleted) {
      await this.handleDownloadFirstSyncCompletion()
    }
  }

  /**
   * When a download-first sync completes, it means we've completed a (potentially multipage)
   * sync where we only downloaded what the server had before uploading anything. We will be
   * allowed to make local accomadations here before the server begins with the upload
   * part of the sync (automatically runs after download-first sync completes).
   * We use this to see if the server has any default itemsKeys, and if so, allows us to
   * delete any never-synced items keys we have here locally.
   */
  private async handleDownloadFirstSyncCompletion() {
    if (!this.hasAccount()) {
      return
    }

    const itemsKeys = this.itemsEncryption.getItemsKeys()
    const neverSyncedKeys = itemsKeys.filter((key) => {
      return key.neverSynced
    })
    const syncedKeys = itemsKeys.filter((key) => {
      return !key.neverSynced
    })

    /**
     * Find isDefault items key that have been previously synced.
     * If we find one, this means we can delete any non-synced keys.
     */
    const defaultSyncedKey = syncedKeys.find((key) => {
      return key.isDefault
    })

    const hasSyncedItemsKey = !isNullOrUndefined(defaultSyncedKey)
    if (hasSyncedItemsKey) {
      /** Delete all never synced keys */
      await this.itemManager.setItemsToBeDeleted(Uuids(neverSyncedKeys))
    } else {
      /**
       * No previous synced items key.
       * We can keep the one(s) we have, only if their version is equal to our root key
       * version. If their version is not equal to our root key version, delete them. If
       * we end up with 0 items keys, create a new one. This covers the case when you open
       * the app offline and it creates an 004 key, and then you sign into an 003 account.
       */
      const rootKeyParams = await this.getRootKeyParams()
      if (rootKeyParams) {
        /** If neverSynced.version != rootKey.version, delete. */
        const toDelete = neverSyncedKeys.filter((itemsKey) => {
          return itemsKey.keyVersion !== rootKeyParams.version
        })
        if (toDelete.length > 0) {
          await this.itemManager.setItemsToBeDeleted(Uuids(toDelete))
        }

        if (this.itemsEncryption.getItemsKeys().length === 0) {
          await this.rootKeyEncryption.createNewDefaultItemsKey()
        }
      }
    }
    /** If we do not have an items key for our current account version, create one */
    const userVersion = this.getUserVersion()
    const accountVersionedKey = this.itemsEncryption
      .getItemsKeys()
      .find((key) => key.keyVersion === userVersion)
    if (isNullOrUndefined(accountVersionedKey)) {
      await this.rootKeyEncryption.createNewDefaultItemsKey()
    }

    this.syncUnsycnedItemsKeys()
  }

  private async handleFullSyncCompletion() {
    /** Always create a new items key after full sync, if no items key is found */
    const currentItemsKey = findDefaultItemsKey(this.itemsEncryption.getItemsKeys())
    if (!currentItemsKey) {
      await this.rootKeyEncryption.createNewDefaultItemsKey()
      if (this.rootKeyEncryption.keyMode === KeyMode.WrapperOnly) {
        return this.itemsEncryption.repersistAllItems()
      }
    }
  }

  /**
   * There is presently an issue where an items key created while signed out of account (
   * or possibly signed in but with invalid session), then signing into account, results in that
   * items key never syncing to the account even though it is being used to encrypt synced items.
   * Until we can determine its cause, this corrective function will find any such keys and sync them.
   */
  private syncUnsycnedItemsKeys(): void {
    if (!this.hasAccount()) {
      return
    }

    const unsyncedKeys = this.itemsEncryption
      .getItemsKeys()
      .filter((key) => key.neverSynced && !key.dirty && !key.deleted)
    if (unsyncedKeys.length > 0) {
      void this.itemManager.setItemsDirty(Uuids(unsyncedKeys))
    }
  }
}

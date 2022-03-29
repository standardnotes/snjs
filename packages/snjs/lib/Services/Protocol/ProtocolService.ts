import { EncryptionSplitWithKey, findPayloadInSplit } from './EncryptionSplit'
import { RootKeyEncryptionService } from './RootKeyEncryption'
import {
  ItemAuthenticatedData,
  LegacyAttachedData,
  RootKeyEncryptedAuthenticatedData,
  PurePayload,
  CreateMaxPayloadFromAnyObject,
  CreateSourcedPayloadFromObject,
  PayloadFormat,
  PayloadSource,
  CreateIntentPayloadFromObject,
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
  removeFromArray,
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
  ItemContentTypeUsesRootKeyEncryption,
} from '@standardnotes/applications'
import { StorageKey } from '@Lib/Services/Storage/storage_keys'
import { StorageValueModes } from '@Lib/Services/Storage/StorageService'
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

type KeyChangeObserver = () => Promise<void>

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
export class SNProtocolService extends AbstractService {
  private operatorManager!: OperatorManager
  private keyMode = KeyMode.RootKeyNone
  private keyObservers: KeyChangeObserver[] = []

  public readonly itemsEncryption!: ItemsEncryptionService
  public readonly rootKeyEncryption!: RootKeyEncryptionService
  private memoizedRootKeyParams?: SNRootKeyParams

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
      itemManager,
      this.operatorManager,
      internalEventBus,
    )

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

    this.itemsEncryption.deinit()
    ;(this.itemsEncryption as unknown) = undefined

    this.rootKeyEncryption.deinit()
    ;(this.rootKeyEncryption as unknown) = undefined

    this.memoizedRootKeyParams = undefined

    this.keyObservers.length = 0
    super.deinit()
  }

  public async initialize() {
    const wrappedRootKey = await this.getWrappedRootKey()
    const accountKeyParams = await this.recomputeAccountKeyParams()
    const hasWrapper = await this.hasRootKeyWrapper()
    const hasRootKey = !isNullOrUndefined(wrappedRootKey) || !isNullOrUndefined(accountKeyParams)
    if (hasWrapper && hasRootKey) {
      this.keyMode = KeyMode.RootKeyPlusWrapper
    } else if (hasWrapper && !hasRootKey) {
      this.keyMode = KeyMode.WrapperOnly
    } else if (!hasWrapper && hasRootKey) {
      this.keyMode = KeyMode.RootKeyOnly
    } else if (!hasWrapper && !hasRootKey) {
      this.keyMode = KeyMode.RootKeyNone
    } else {
      throw 'Invalid key mode condition'
    }

    if (this.keyMode === KeyMode.RootKeyOnly) {
      this.rootKeyEncryption.setRootKey(await this.getRootKeyFromKeychain())
      await this.notifyObserversOfKeyChange()
    }
  }

  private async getEncryptionSourceVersion() {
    if (this.hasAccount()) {
      return this.getUserVersion()
    } else if (this.hasPasscode()) {
      const passcodeParams = await this.getRootKeyWrapperKeyParams()
      return passcodeParams!.version
    }
  }

  /**
   * Returns encryption protocol display name for active account/wrapper
   */
  public async getEncryptionDisplayName() {
    const version = await this.getEncryptionSourceVersion()
    if (version) {
      return this.operatorManager.operatorForVersion(version).getEncryptionDisplayName()
    }
  }

  public getLatestVersion() {
    return ProtocolVersionLatest
  }

  public hasAccount() {
    switch (this.keyMode) {
      case KeyMode.RootKeyNone:
      case KeyMode.WrapperOnly:
        return false
      case KeyMode.RootKeyOnly:
      case KeyMode.RootKeyPlusWrapper:
        return true
      default:
        throw Error(`Unhandled keyMode value '${this.keyMode}'.`)
    }
  }

  /**
   * Returns the protocol version associated with the user's account
   */
  public getUserVersion(): ProtocolVersion | undefined {
    const keyParams = this.getAccountKeyParams()
    return keyParams?.version
  }

  /**
   * Returns true if there is an upgrade available for the account or passcode
   */
  public async upgradeAvailable() {
    const accountUpgradeAvailable = await this.accountUpgradeAvailable()
    const passcodeUpgradeAvailable = await this.passcodeUpgradeAvailable()
    return accountUpgradeAvailable || passcodeUpgradeAvailable
  }

  public async encryptSplit(
    split: EncryptionSplitWithKey<PurePayload>,
    intent: EncryptionIntent,
  ): Promise<PurePayload[]> {
    const allEncrypted: PurePayload[] = []

    if (split.usesRootKey) {
      const rootKeyEncrypted = await this.rootKeyEncryption.encryptPayloads(
        split.usesRootKey.items,
        split.usesRootKey.key,
      )
      extendArray(allEncrypted, rootKeyEncrypted)
    }

    if (split.usesItemsKey) {
      const itemsKeyEncrypted = await this.itemsEncryption.encryptPayloads(
        split.usesItemsKey.items,
        split.usesItemsKey.key,
      )
      extendArray(allEncrypted, itemsKeyEncrypted)
    }

    if (split.usesRootKeyWithKeyLookup) {
      const rootKeyEncrypted = await this.rootKeyEncryption.encryptPayloadsWithKeyLookup(
        split.usesRootKeyWithKeyLookup.items,
      )
      extendArray(allEncrypted, rootKeyEncrypted)
    }

    if (split.usesItemsKeyWithKeyLookup) {
      const itemsKeyEncrypted = await this.itemsEncryption.encryptPayloadsWithKeyLookup(
        split.usesItemsKeyWithKeyLookup.items,
      )
      extendArray(allEncrypted, itemsKeyEncrypted)
    }

    const exported = allEncrypted.map((encryptedPayload) =>
      CreateIntentPayloadFromObject(
        findPayloadInSplit(encryptedPayload.uuid, split),
        intent,
        encryptedPayload,
      ),
    )

    return exported
  }

  public async decryptSplit(split: EncryptionSplitWithKey<PurePayload>): Promise<PurePayload[]> {
    const allDecrypted: PurePayload[] = []

    if (split.usesRootKey) {
      const rootKeyDecrypted = await this.rootKeyEncryption.decryptPayloads(
        split.usesRootKey.items,
        split.usesRootKey.key,
      )
      extendArray(allDecrypted, rootKeyDecrypted)
    }

    if (split.usesItemsKey) {
      const itemsKeyDecrypted = await this.itemsEncryption.decryptPayloads(
        split.usesItemsKey.items,
        split.usesItemsKey.key,
      )
      extendArray(allDecrypted, itemsKeyDecrypted)
    }

    return allDecrypted
  }

  /**
   * Returns true if the user's account protocol version is not equal to the latest version.
   */
  public async accountUpgradeAvailable() {
    const userVersion = this.getUserVersion()
    if (!userVersion) {
      return false
    }
    return userVersion !== ProtocolVersionLatest
  }

  /**
   * Returns true if the user's account protocol version is not equal to the latest version.
   */
  public async passcodeUpgradeAvailable() {
    const passcodeParams = await this.getRootKeyWrapperKeyParams()
    if (!passcodeParams) {
      return false
    }
    return passcodeParams.version !== ProtocolVersionLatest
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
    const version = keyParams.version
    const operator = this.operatorManager.operatorForVersion(version)
    return operator.computeRootKey(password, keyParams)
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
    const operator = version
      ? this.operatorManager.operatorForVersion(version)
      : this.operatorManager.defaultOperator()
    return operator.createRootKey(identifier, password, origination)
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

  /**
   * Creates a JSON string representing the backup format of all items, or just subitems
   * if supplied.
   * @returns JSON stringified representation of data, including keyParams.
   */
  public async createBackupFile(intent: EncryptionIntent): Promise<BackupFile> {
    let items = this.itemManager.items

    if (intent === EncryptionIntent.FileDecrypted) {
      items = items.filter((item) => item.content_type !== ContentType.ItemsKey)
    }

    const ejectedPayloadsPromise = Promise.all(
      items.map((item) => {
        if (item.errorDecrypting) {
          /** Keep payload as-is */
          return item.payload.ejected()
        } else {
          const payload = CreateSourcedPayloadFromObject(item.payload, PayloadSource.FileImport)
          if (ItemContentTypeUsesRootKeyEncryption(payload.content_type)) {
            return this.rootKeyEncryption.encryptPayload(payload, intent).then((p) => p.ejected())
          } else {
            return this.itemsEncryption.encryptPayload(payload, intent).then((p) => p.ejected())
          }
        }
      }),
    )

    const data: BackupFile = {
      version: ProtocolVersionLatest,
      items: await ejectedPayloadsPromise,
    }

    if (intent === EncryptionIntent.FileEncrypted) {
      const keyParams = await this.getRootKeyParams()
      data.keyParams = keyParams?.getPortableValue()
    }
    return data
  }

  /**
   * Register a callback to be notified when root key status changes.
   * @param callback  A function that takes in a content type to call back when root
   *                  key or wrapper status has changed.
   */
  public onKeyStatusChange(callback: KeyChangeObserver) {
    this.keyObservers.push(callback)
    return () => {
      removeFromArray(this.keyObservers, callback)
    }
  }

  private async notifyObserversOfKeyChange() {
    await this.recomputeAccountKeyParams()
    this.itemsEncryption.userVersion = this.getUserVersion()
    for (const observer of this.keyObservers) {
      await observer()
    }
  }

  private async getRootKeyFromKeychain() {
    const rawKey = await this.deviceInterface.getNamespacedKeychainValue(this.identifier)
    if (isNullOrUndefined(rawKey)) {
      return undefined
    }
    const rootKey = SNRootKey.Create({
      ...rawKey,
      keyParams: await this.getRootKeyParams(),
    })
    return rootKey
  }

  private async saveRootKeyToKeychain() {
    if (this.rootKeyEncryption.getRootKey() == undefined) {
      throw 'Attempting to non-existent root key to the keychain.'
    }
    if (this.keyMode !== KeyMode.RootKeyOnly) {
      throw 'Should not be persisting wrapped key to keychain.'
    }
    const rawKey = this.rootKeyEncryption.getRootKey()!.getKeychainValue()
    return this.executeCriticalFunction(() => {
      return this.deviceInterface.setNamespacedKeychainValue(rawKey, this.identifier)
    })
  }

  /**
   * @returns True if a root key wrapper (passcode) is configured.
   */
  public async hasRootKeyWrapper() {
    const wrapper = await this.getRootKeyWrapperKeyParams()
    return !isNullOrUndefined(wrapper)
  }

  /**
   * A non-async alternative to `hasRootKeyWrapper` which uses pre-loaded state
   * to determine if a passcode is configured.
   */
  public hasPasscode() {
    return this.keyMode === KeyMode.WrapperOnly || this.keyMode === KeyMode.RootKeyPlusWrapper
  }

  /**
   * @returns True if the root key has not yet been unwrapped (passcode locked).
   */
  public async rootKeyNeedsUnwrapping() {
    return (await this.hasRootKeyWrapper()) && this.rootKeyEncryption.getRootKey() == undefined
  }

  /**
   * @returns Key params object containing root key wrapper key params
   */
  public async getRootKeyWrapperKeyParams() {
    const rawKeyParams = await this.storageService.getValue(
      StorageKey.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped,
    )
    if (!rawKeyParams) {
      return undefined
    }
    return this.createKeyParams(rawKeyParams)
  }

  /**
   * @returns Object containing persisted wrapped (encrypted) root key
   */
  private async getWrappedRootKey() {
    return this.storageService.getValue(StorageKey.WrappedRootKey, StorageValueModes.Nonwrapped)
  }

  /**
   * Returns rootKeyParams by reading from storage.
   */
  public async getRootKeyParams() {
    if (this.keyMode === KeyMode.WrapperOnly) {
      return this.getRootKeyWrapperKeyParams()
    } else if (
      this.keyMode === KeyMode.RootKeyOnly ||
      this.keyMode === KeyMode.RootKeyPlusWrapper
    ) {
      return this.recomputeAccountKeyParams()
    } else if (this.keyMode === KeyMode.RootKeyNone) {
      return undefined
    } else {
      throw `Unhandled key mode for getRootKeyParams ${this.keyMode}`
    }
  }

  private async recomputeAccountKeyParams(): Promise<SNRootKeyParams | undefined> {
    const rawKeyParams = await this.storageService.getValue(
      StorageKey.RootKeyParams,
      StorageValueModes.Nonwrapped,
    )
    if (!rawKeyParams) {
      return
    }

    this.memoizedRootKeyParams = this.createKeyParams(rawKeyParams)
    return this.memoizedRootKeyParams
  }

  /**
   * @returns getRootKeyParams may return different params based on different
   *           keyMode. This function however strictly returns only account params.
   */
  public getAccountKeyParams() {
    return this.memoizedRootKeyParams
  }

  /**
   * We know a wrappingKey is correct if it correctly decrypts
   * wrapped root key.
   */
  public async validateWrappingKey(wrappingKey: SNRootKey) {
    const wrappedRootKey = await this.getWrappedRootKey()
    /** If wrapper only, storage is encrypted directly with wrappingKey */
    if (this.keyMode === KeyMode.WrapperOnly) {
      return this.storageService.canDecryptWithKey(wrappingKey)
    } else if (
      this.keyMode === KeyMode.RootKeyOnly ||
      this.keyMode === KeyMode.RootKeyPlusWrapper
    ) {
      /**
       * In these modes, storage is encrypted with account keys, and
       * account keys are encrypted with wrappingKey. Here we validate
       * by attempting to decrypt account keys.
       */
      const wrappedKeyPayload = CreateMaxPayloadFromAnyObject(wrappedRootKey)
      const decrypted = await this.rootKeyEncryption.decryptPayload(wrappedKeyPayload, wrappingKey)
      return !decrypted.errorDecrypting
    } else {
      throw 'Unhandled case in validateWrappingKey'
    }
  }

  /**
   * Computes the root key wrapping key given a passcode.
   * Wrapping key params are read from disk.
   */
  public async computeWrappingKey(passcode: string) {
    const keyParams = await this.getRootKeyWrapperKeyParams()
    const key = await this.computeRootKey(passcode, keyParams!)
    return key
  }

  /**
   * Unwraps the persisted root key value using the supplied wrappingKey.
   * Application interfaces must check to see if the root key requires unwrapping on load.
   * If so, they must generate the unwrapping key by getting our saved wrapping key keyParams.
   * After unwrapping, the root key is automatically loaded.
   */
  public async unwrapRootKey(wrappingKey: SNRootKey) {
    if (this.keyMode === KeyMode.WrapperOnly) {
      this.rootKeyEncryption.setRootKey(wrappingKey)
      return
    }

    if (this.keyMode !== KeyMode.RootKeyPlusWrapper) {
      throw 'Invalid key mode condition for unwrapping.'
    }

    const wrappedKey = await this.getWrappedRootKey()
    const payload = CreateMaxPayloadFromAnyObject(wrappedKey)
    const decrypted = await this.rootKeyEncryption.decryptPayload(payload, wrappingKey)

    if (decrypted.errorDecrypting) {
      throw Error('Unable to decrypt root key with provided wrapping key.')
    } else {
      this.rootKeyEncryption.setRootKey(
        SNRootKey.Create(decrypted.contentObject as any, decrypted.uuid),
      )
      await this.notifyObserversOfKeyChange()
    }
  }
  /**
   * Encrypts rootKey and saves it in storage instead of keychain, and then
   * clears keychain. This is because we don't want to store large encrypted
   * payloads in the keychain. If the root key is not wrapped, it is stored
   * in plain form in the user's secure keychain.
   */
  public async setNewRootKeyWrapper(wrappingKey: SNRootKey) {
    if (this.keyMode === KeyMode.RootKeyNone) {
      this.keyMode = KeyMode.WrapperOnly
    } else if (this.keyMode === KeyMode.RootKeyOnly) {
      this.keyMode = KeyMode.RootKeyPlusWrapper
    } else {
      throw Error('Attempting to set wrapper on already wrapped key.')
    }

    await this.deviceInterface.clearNamespacedKeychainValue(this.identifier)

    if (this.keyMode === KeyMode.WrapperOnly || this.keyMode === KeyMode.RootKeyPlusWrapper) {
      if (this.keyMode === KeyMode.WrapperOnly) {
        this.rootKeyEncryption.setRootKey(wrappingKey)
        await this.rootKeyEncryption.reencryptItemsKeys()
      } else {
        await this.wrapAndPersistRootKey(wrappingKey)
      }
      await this.storageService.setValue(
        StorageKey.RootKeyWrapperKeyParams,
        wrappingKey.keyParams.getPortableValue(),
        StorageValueModes.Nonwrapped,
      )
      await this.notifyObserversOfKeyChange()
    } else {
      throw Error('Invalid keyMode on setNewRootKeyWrapper')
    }
  }

  /**
   * Wraps the current in-memory root key value using the wrappingKey,
   * then persists the wrapped value to disk.
   */
  private async wrapAndPersistRootKey(wrappingKey: SNRootKey) {
    const payload = CreateMaxPayloadFromAnyObject(this.rootKeyEncryption.getRootKey()!, {
      content: this.rootKeyEncryption.getRootKey()!.persistableValueWhenWrapping(),
    })

    const wrappedKey = await this.rootKeyEncryption.encryptPayload(
      payload,
      EncryptionIntent.LocalStorageEncrypted,
      wrappingKey,
    )

    await this.storageService.setValue(
      StorageKey.WrappedRootKey,
      wrappedKey.ejected(),
      StorageValueModes.Nonwrapped,
    )
  }

  /**
   * Removes root key wrapper from local storage and stores root key bare in secure keychain.
   */
  public async removeRootKeyWrapper(): Promise<void> {
    if (this.keyMode !== KeyMode.WrapperOnly && this.keyMode !== KeyMode.RootKeyPlusWrapper) {
      throw Error('Attempting to remove root key wrapper on unwrapped key.')
    }

    if (this.keyMode === KeyMode.WrapperOnly) {
      this.keyMode = KeyMode.RootKeyNone
      this.rootKeyEncryption.setRootKey(undefined)
    } else if (this.keyMode === KeyMode.RootKeyPlusWrapper) {
      this.keyMode = KeyMode.RootKeyOnly
    }

    await this.storageService.removeValue(StorageKey.WrappedRootKey, StorageValueModes.Nonwrapped)
    await this.storageService.removeValue(
      StorageKey.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped,
    )

    if (this.keyMode === KeyMode.RootKeyOnly) {
      await this.saveRootKeyToKeychain()
    }

    await this.notifyObserversOfKeyChange()
  }

  /**
   * The root key is distinct from regular keys and are only saved locally in the keychain,
   * in non-item form. Applications set root key on sign in, register, or password change.
   * @param key A SNRootKey object.
   * @param wrappingKey If a passcode is configured, the wrapping key
   * must be supplied, so that the new root key can be wrapped with the wrapping key.
   */
  public async setRootKey(key: SNRootKey, wrappingKey?: SNRootKey) {
    if (!key.keyParams) {
      throw Error('keyParams must be supplied if setting root key.')
    }

    if (this.rootKeyEncryption.getRootKey() === key) {
      throw Error('Attempting to set root key as same current value.')
    }

    if (this.keyMode === KeyMode.WrapperOnly) {
      this.keyMode = KeyMode.RootKeyPlusWrapper
    } else if (this.keyMode === KeyMode.RootKeyNone) {
      this.keyMode = KeyMode.RootKeyOnly
    } else if (
      this.keyMode === KeyMode.RootKeyOnly ||
      this.keyMode === KeyMode.RootKeyPlusWrapper
    ) {
      /** Root key is simply changing, mode stays the same */
      /** this.keyMode = this.keyMode; */
    } else {
      throw Error(`Unhandled key mode for setNewRootKey ${this.keyMode}`)
    }

    this.rootKeyEncryption.setRootKey(key)

    await this.storageService.setValue(
      StorageKey.RootKeyParams,
      key.keyParams.getPortableValue(),
      StorageValueModes.Nonwrapped,
    )

    if (this.keyMode === KeyMode.RootKeyOnly) {
      await this.saveRootKeyToKeychain()
    } else if (this.keyMode === KeyMode.RootKeyPlusWrapper) {
      if (!wrappingKey) {
        throw Error('wrappingKey must be supplied')
      }
      await this.wrapAndPersistRootKey(wrappingKey)
    }

    await this.notifyObserversOfKeyChange()
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
    await this.deviceInterface.clearNamespacedKeychainValue(this.identifier)
    await this.storageService.removeValue(StorageKey.WrappedRootKey, StorageValueModes.Nonwrapped)
    await this.storageService.removeValue(
      StorageKey.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped,
    )
    await this.storageService.removeValue(StorageKey.RootKeyParams, StorageValueModes.Nonwrapped)
    this.keyMode = KeyMode.RootKeyNone
    this.rootKeyEncryption.setRootKey(undefined)
    await this.notifyObserversOfKeyChange()
  }

  /**
   * @param password  The password string to generate a root key from.
   */
  public async validateAccountPassword(password: string) {
    const keyParams = await this.getRootKeyParams()
    const key = await this.computeRootKey(password, keyParams!)
    const valid = this.rootKeyEncryption.getRootKey()!.compare(key)
    if (valid) {
      return { valid, artifacts: { rootKey: key } }
    } else {
      return { valid: false }
    }
  }

  /**
   * @param passcode  The passcode string to generate a root key from.
   */
  public async validatePasscode(passcode: string) {
    const keyParams = await this.getRootKeyWrapperKeyParams()
    const key = await this.computeRootKey(passcode, keyParams!)
    const valid = await this.validateWrappingKey(key)
    if (valid) {
      return { valid, artifacts: { wrappingKey: key } }
    } else {
      return { valid: false }
    }
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
      if (this.keyMode === KeyMode.WrapperOnly) {
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

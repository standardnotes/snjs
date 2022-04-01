import { RootKeyInKeychain } from './../../RootKey/Types'
import { CreateAnyKeyParams } from '../../RootKey/KeyParams'
import { findDefaultItemsKey } from '../Functions'
import { KeyMode } from './KeyMode'
import { OperatorManager } from '../../Operator/OperatorManager'
import { SNRootKey } from '../../RootKey/RootKey'
import { SNRootKeyParams } from '../../RootKey/RootKeyParams'
import { UuidGenerator } from '@standardnotes/utils'
import * as Common from '@standardnotes/common'
import * as Models from '@standardnotes/models'
import * as OperatorWrapper from '../../Operator/OperatorWrapper'
import * as Services from '@standardnotes/services'
import { mergePayloadWithEncryptionParameters } from '../../Intent/Functions'
import {
  DecryptedParameters,
  EncryptedParameters,
  ErroredDecryptingParameters,
} from '../../Encryption/EncryptedParameters'
import { ItemsKeyMutator } from '../../ItemsKey'
import { CreateNewRootKey } from '../../RootKey/Functions'
import { FillItemContent, ItemsKeyContent, ItemsKeyContentSpecialized } from '@standardnotes/models'

export enum RootKeyServiceEvent {
  RootKeyStatusChanged = 'RootKeyStatusChanged',
}

export class RootKeyEncryptionService extends Services.AbstractService<RootKeyServiceEvent> {
  private rootKey?: SNRootKey
  public keyMode = KeyMode.RootKeyNone
  public memoizedRootKeyParams?: SNRootKeyParams

  constructor(
    private itemManager: Services.ItemManagerInterface,
    private operatorManager: OperatorManager,
    public deviceInterface: Services.DeviceInterface,
    private storageService: Services.StorageServiceInterface,
    private identifier: Common.ApplicationIdentifier,
    protected internalEventBus: Services.InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  public deinit(): void {
    ;(this.itemManager as unknown) = undefined
    this.rootKey = undefined
    this.memoizedRootKeyParams = undefined
    super.deinit()
  }

  public async initialize() {
    const wrappedRootKey = await this.getWrappedRootKey()
    const accountKeyParams = await this.recomputeAccountKeyParams()
    const hasWrapper = await this.hasRootKeyWrapper()
    const hasRootKey = wrappedRootKey != undefined || accountKeyParams != undefined

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
      this.setRootKeyInstance(await this.getRootKeyFromKeychain())
      await this.handleKeyStatusChange()
    }
  }

  private async handleKeyStatusChange() {
    await this.recomputeAccountKeyParams()
    void this.notifyEvent(RootKeyServiceEvent.RootKeyStatusChanged)
  }

  public async passcodeUpgradeAvailable() {
    const passcodeParams = await this.getRootKeyWrapperKeyParams()
    if (!passcodeParams) {
      return false
    }
    return passcodeParams.version !== Common.ProtocolVersionLatest
  }

  public async hasRootKeyWrapper() {
    const wrapper = await this.getRootKeyWrapperKeyParams()
    return wrapper != undefined
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

  public hasRootKeyEncryptionSource(): boolean {
    return this.hasAccount() || this.hasPasscode()
  }

  public hasPasscode() {
    return this.keyMode === KeyMode.WrapperOnly || this.keyMode === KeyMode.RootKeyPlusWrapper
  }

  public async getEncryptionSourceVersion(): Promise<Common.ProtocolVersion> {
    if (this.hasAccount()) {
      return this.getSureUserVersion()
    } else if (this.hasPasscode()) {
      const passcodeParams = await this.getSureRootKeyWrapperKeyParams()
      return passcodeParams.version
    }

    throw Error('Attempting to access encryption source version without source')
  }

  public getUserVersion(): Common.ProtocolVersion | undefined {
    const keyParams = this.memoizedRootKeyParams
    return keyParams?.version
  }

  private getSureUserVersion(): Common.ProtocolVersion {
    const keyParams = this.memoizedRootKeyParams as SNRootKeyParams
    return keyParams.version
  }

  private async getRootKeyFromKeychain() {
    const rawKey = (await this.deviceInterface.getNamespacedKeychainValue(this.identifier)) as
      | RootKeyInKeychain
      | undefined

    if (rawKey == undefined) {
      return undefined
    }

    const keyParams = await this.getSureRootKeyParams()

    return CreateNewRootKey({
      ...rawKey,
      keyParams: keyParams.getPortableValue(),
    })
  }

  private async saveRootKeyToKeychain() {
    if (this.getRootKey() == undefined) {
      throw 'Attempting to non-existent root key to the keychain.'
    }
    if (this.keyMode !== KeyMode.RootKeyOnly) {
      throw 'Should not be persisting wrapped key to keychain.'
    }
    const rawKey = this.getSureRootKey().getKeychainValue()

    return this.executeCriticalFunction(() => {
      return this.deviceInterface.setNamespacedKeychainValue(rawKey, this.identifier)
    })
  }

  public async getRootKeyWrapperKeyParams(): Promise<SNRootKeyParams | undefined> {
    const rawKeyParams = await this.storageService.getValue(
      Services.StorageKey.RootKeyWrapperKeyParams,
      Services.StorageValueModes.Nonwrapped,
    )

    if (!rawKeyParams) {
      return undefined
    }

    return CreateAnyKeyParams(rawKeyParams as Common.AnyKeyParamsContent)
  }

  public async getSureRootKeyWrapperKeyParams() {
    return this.getRootKeyWrapperKeyParams() as Promise<SNRootKeyParams>
  }

  public async getRootKeyParams(): Promise<SNRootKeyParams | undefined> {
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

  public async getSureRootKeyParams(): Promise<SNRootKeyParams> {
    return this.getRootKeyParams() as Promise<SNRootKeyParams>
  }

  public async computeRootKey(password: string, keyParams: SNRootKeyParams) {
    const version = keyParams.version
    const operator = this.operatorManager.operatorForVersion(version)
    return operator.computeRootKey(password, keyParams)
  }

  public async createRootKey(
    identifier: string,
    password: string,
    origination: Common.KeyParamsOrigination,
    version?: Common.ProtocolVersion,
  ) {
    const operator = version
      ? this.operatorManager.operatorForVersion(version)
      : this.operatorManager.defaultOperator()
    return operator.createRootKey(identifier, password, origination)
  }

  private getSureMemoizedRootKeyParams(): SNRootKeyParams {
    return this.memoizedRootKeyParams as SNRootKeyParams
  }

  public async validateAccountPassword(password: string) {
    const key = await this.computeRootKey(password, this.getSureMemoizedRootKeyParams())
    const valid = this.getSureRootKey().compare(key)
    if (valid) {
      return { valid, artifacts: { rootKey: key } }
    } else {
      return { valid: false }
    }
  }

  public async validatePasscode(passcode: string) {
    const keyParams = await this.getSureRootKeyWrapperKeyParams()
    const key = await this.computeRootKey(passcode, keyParams)
    const valid = await this.validateWrappingKey(key)
    if (valid) {
      return { valid, artifacts: { wrappingKey: key } }
    } else {
      return { valid: false }
    }
  }

  /**
   * We know a wrappingKey is correct if it correctly decrypts
   * wrapped root key.
   */
  public async validateWrappingKey(wrappingKey: SNRootKey) {
    const wrappedRootKey = (await this.getWrappedRootKey()) as Models.RawPayload

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
      const wrappedKeyPayload = Models.CreateMaxPayloadFromAnyObject(wrappedRootKey)
      const decrypted = await this.decryptPayload(wrappedKeyPayload, wrappingKey)
      return !decrypted.errorDecrypting
    } else {
      throw 'Unhandled case in validateWrappingKey'
    }
  }

  private async recomputeAccountKeyParams(): Promise<SNRootKeyParams | undefined> {
    const rawKeyParams = await this.storageService.getValue(
      Services.StorageKey.RootKeyParams,
      Services.StorageValueModes.Nonwrapped,
    )

    if (!rawKeyParams) {
      return
    }

    this.memoizedRootKeyParams = CreateAnyKeyParams(rawKeyParams as Common.AnyKeyParamsContent)
    return this.memoizedRootKeyParams
  }

  /**
   * Wraps the current in-memory root key value using the wrappingKey,
   * then persists the wrapped value to disk.
   */
  private async wrapAndPersistRootKey(wrappingKey: SNRootKey) {
    const payload = Models.CreateMaxPayloadFromAnyObject(this.getSureRootKey(), {
      content: FillItemContent(this.getSureRootKey().persistableValueWhenWrapping()),
    })

    const wrappedKey = await this.encryptSplitSingle(payload, wrappingKey)
    const wrappedKeyPayload = mergePayloadWithEncryptionParameters(payload, wrappedKey)

    this.storageService.setValue(
      Services.StorageKey.WrappedRootKey,
      wrappedKeyPayload.ejected(),
      Services.StorageValueModes.Nonwrapped,
    )
  }

  public async unwrapRootKey(wrappingKey: SNRootKey) {
    if (this.keyMode === KeyMode.WrapperOnly) {
      this.setRootKeyInstance(wrappingKey)
      return
    }

    if (this.keyMode !== KeyMode.RootKeyPlusWrapper) {
      throw 'Invalid key mode condition for unwrapping.'
    }

    const wrappedKey = (await this.getWrappedRootKey()) as Models.RawPayload<Models.RootKeyContent>
    const payload = Models.CreateMaxPayloadFromAnyObject(wrappedKey)
    const decrypted = await this.decryptPayload(payload, wrappingKey)

    if (decrypted.errorDecrypting) {
      throw Error('Unable to decrypt root key with provided wrapping key.')
    } else {
      const decryptedPayload = mergePayloadWithEncryptionParameters(payload, decrypted)
      this.setRootKeyInstance(new SNRootKey(decryptedPayload))
      await this.handleKeyStatusChange()
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
        this.setRootKeyInstance(wrappingKey)
        await this.reencryptItemsKeys()
      } else {
        await this.wrapAndPersistRootKey(wrappingKey)
      }
      await this.storageService.setValue(
        Services.StorageKey.RootKeyWrapperKeyParams,
        wrappingKey.keyParams.getPortableValue(),
        Services.StorageValueModes.Nonwrapped,
      )
      await this.handleKeyStatusChange()
    } else {
      throw Error('Invalid keyMode on setNewRootKeyWrapper')
    }
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
      this.setRootKeyInstance(undefined)
    } else if (this.keyMode === KeyMode.RootKeyPlusWrapper) {
      this.keyMode = KeyMode.RootKeyOnly
    }

    await this.storageService.removeValue(
      Services.StorageKey.WrappedRootKey,
      Services.StorageValueModes.Nonwrapped,
    )
    await this.storageService.removeValue(
      Services.StorageKey.RootKeyWrapperKeyParams,
      Services.StorageValueModes.Nonwrapped,
    )

    if (this.keyMode === KeyMode.RootKeyOnly) {
      await this.saveRootKeyToKeychain()
    }

    await this.handleKeyStatusChange()
  }

  public async setRootKey(key: SNRootKey, wrappingKey?: SNRootKey) {
    if (!key.keyParams) {
      throw Error('keyParams must be supplied if setting root key.')
    }

    if (this.getRootKey() === key) {
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

    this.setRootKeyInstance(key)

    await this.storageService.setValue(
      Services.StorageKey.RootKeyParams,
      key.keyParams.getPortableValue(),
      Services.StorageValueModes.Nonwrapped,
    )

    if (this.keyMode === KeyMode.RootKeyOnly) {
      await this.saveRootKeyToKeychain()
    } else if (this.keyMode === KeyMode.RootKeyPlusWrapper) {
      if (!wrappingKey) {
        throw Error('wrappingKey must be supplied')
      }
      await this.wrapAndPersistRootKey(wrappingKey)
    }

    await this.handleKeyStatusChange()
  }

  /**
   * Deletes root key and wrapper from keychain. Used when signing out of application.
   */
  public async clearLocalKeyState() {
    await this.deviceInterface.clearNamespacedKeychainValue(this.identifier)
    await this.storageService.removeValue(
      Services.StorageKey.WrappedRootKey,
      Services.StorageValueModes.Nonwrapped,
    )
    await this.storageService.removeValue(
      Services.StorageKey.RootKeyWrapperKeyParams,
      Services.StorageValueModes.Nonwrapped,
    )
    await this.storageService.removeValue(
      Services.StorageKey.RootKeyParams,
      Services.StorageValueModes.Nonwrapped,
    )
    this.keyMode = KeyMode.RootKeyNone
    this.setRootKeyInstance(undefined)

    await this.handleKeyStatusChange()
  }

  private getWrappedRootKey() {
    return this.storageService.getValue(
      Services.StorageKey.WrappedRootKey,
      Services.StorageValueModes.Nonwrapped,
    )
  }

  public setRootKeyInstance(rootKey: SNRootKey | undefined): void {
    this.rootKey = rootKey
  }

  public getRootKey(): SNRootKey | undefined {
    return this.rootKey
  }

  private getSureRootKey(): SNRootKey {
    return this.rootKey as SNRootKey
  }

  private getItemsKeys() {
    return this.itemManager.itemsKeys()
  }

  public async encryptSplitSingleWithKeyLookup(
    payload: Models.PurePayload,
  ): Promise<EncryptedParameters> {
    const key = this.getRootKey()

    if (key == undefined) {
      throw Error('Attempting root key encryption with no root key')
    }

    return this.encryptSplitSingle(payload, key)
  }

  public async encryptSplitSinglesWithKeyLookup(
    payloads: Models.PurePayload[],
  ): Promise<EncryptedParameters[]> {
    return Promise.all(payloads.map((payload) => this.encryptSplitSingleWithKeyLookup(payload)))
  }

  public async encryptSplitSingle(
    payload: Models.PurePayload,
    key: SNRootKey,
  ): Promise<EncryptedParameters> {
    return OperatorWrapper.encryptPayload(payload, key, this.operatorManager)
  }

  public async encryptSplitSingles(payloads: Models.PurePayload[], key: SNRootKey) {
    return Promise.all(payloads.map((payload) => this.encryptSplitSingle(payload, key)))
  }

  public async decryptPayloadWithKeyLookup(
    payload: Models.PurePayload,
  ): Promise<DecryptedParameters | ErroredDecryptingParameters> {
    const key = this.getRootKey()

    if (key == undefined) {
      return {
        uuid: payload.uuid,
        errorDecrypting: true,
        waitingForKey: true,
      }
    }

    return this.decryptPayload(payload, key)
  }

  public async decryptPayload<C extends Models.ItemContent = Models.ItemContent>(
    payload: Models.PayloadInterface<C>,
    key: SNRootKey,
  ): Promise<DecryptedParameters<C> | ErroredDecryptingParameters> {
    return OperatorWrapper.decryptPayload(payload, key, this.operatorManager)
  }

  public async decryptPayloadsWithKeyLookup(
    payloads: Models.PurePayload[],
  ): Promise<(DecryptedParameters | ErroredDecryptingParameters)[]> {
    return Promise.all(payloads.map((payload) => this.decryptPayloadWithKeyLookup(payload)))
  }

  public async decryptPayloads(
    payloads: Models.PurePayload[],
    key: SNRootKey,
  ): Promise<(DecryptedParameters | ErroredDecryptingParameters)[]> {
    return Promise.all(payloads.map((payload) => this.decryptPayload(payload, key)))
  }

  /**
   * When the root key changes (non-null only), we must re-encrypt all items
   * keys with this new root key (by simply re-syncing).
   */
  public async reencryptItemsKeys(): Promise<void> {
    const itemsKeys = this.getItemsKeys()
    if (itemsKeys.length > 0) {
      /**
       * Do not call sync after marking dirty.
       * Re-encrypting items keys is called by consumers who have specific flows who
       * will sync on their own timing
       */
      await this.itemManager.setItemsDirty(Models.Uuids(itemsKeys))
    }
  }

  /**
   * Creates a new random items key to use for item encryption, and adds it to model management.
   * Consumer must call sync. If the protocol version <= 003, only one items key should be created,
   * and its .itemsKey value should be equal to the root key masterKey value.
   */
  public async createNewDefaultItemsKey(): Promise<Models.ItemsKeyInterface> {
    const rootKey = this.getSureRootKey()
    const operatorVersion = rootKey ? rootKey.keyVersion : Common.ProtocolVersionLatest
    let itemTemplate: Models.ItemsKeyInterface

    if (Common.compareVersions(operatorVersion, Common.ProtocolVersionLastNonrootItemsKey) <= 0) {
      /** Create root key based items key */
      const payload = Models.CreateMaxPayloadFromAnyObject<ItemsKeyContent>({
        uuid: UuidGenerator.GenerateUuid(),
        content_type: Common.ContentType.ItemsKey,
        content: Models.FillItemContentSpecialized<ItemsKeyContentSpecialized, ItemsKeyContent>({
          itemsKey: rootKey.masterKey,
          dataAuthenticationKey: rootKey.dataAuthenticationKey,
          version: operatorVersion,
        }),
      })
      itemTemplate = Models.CreateItemFromPayload(payload) as Models.ItemsKeyInterface
    } else {
      /** Create independent items key */
      itemTemplate = this.operatorManager.operatorForVersion(operatorVersion).createItemsKey()
    }

    const itemsKeys = this.getItemsKeys()
    const defaultKeys = itemsKeys.filter((key) => {
      return key.isDefault
    })

    for (const key of defaultKeys) {
      await this.itemManager.changeItemsKey(key.uuid, (mutator) => {
        mutator.isDefault = false
      })
    }

    const itemsKey = (await this.itemManager.insertItem(itemTemplate)) as Models.ItemsKeyInterface
    await this.itemManager.changeItemsKey(itemsKey.uuid, (mutator) => {
      mutator.isDefault = true
    })

    return itemsKey
  }

  public async createNewItemsKeyWithRollback(): Promise<() => Promise<void>> {
    const currentDefaultItemsKey = findDefaultItemsKey(this.getItemsKeys())
    const newDefaultItemsKey = await this.createNewDefaultItemsKey()

    const rollback = async () => {
      await this.itemManager.setItemToBeDeleted(newDefaultItemsKey.uuid)

      if (currentDefaultItemsKey) {
        await this.itemManager.changeItem<ItemsKeyMutator>(
          currentDefaultItemsKey.uuid,
          (mutator) => {
            mutator.isDefault = true
          },
        )
      }
    }

    return rollback
  }
}

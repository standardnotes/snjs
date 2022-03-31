import {
  PurePayload,
  CreateMaxPayloadFromAnyObject,
  FillItemContent,
  EncryptedParameters,
  ErroredDecryptingParameters,
  DecryptedParameters,
  mergePayloadWithEncryptionParameters,
  RawPayload,
} from '@standardnotes/payloads'

import {
  SNItemsKey,
  CreateItemFromPayload,
  ItemsKeyMutator,
  Uuids,
  RootKeyContent,
} from '@standardnotes/models'
import { SNRootKey } from '../../RootKey/RootKey'
import { UuidGenerator } from '@standardnotes/utils'
import {
  ContentType,
  ProtocolVersionLatest,
  ProtocolVersionLastNonrootItemsKey,
  ProtocolVersion,
  KeyParamsOrigination,
  AnyKeyParamsContent,
} from '@standardnotes/common'
import { ApplicationIdentifier, compareVersions } from '@standardnotes/applications'
import { findDefaultItemsKey } from '../Functions'
import { OperatorManager } from '../../Operator/OperatorManager'
import * as OperatorWrapper from '../../Operator/OperatorWrapper'
import { KeyMode } from './KeyMode'
import {
  DeviceInterface,
  AbstractService,
  InternalEventBusInterface,
  ItemManagerInterface,
  StorageServiceInterface,
  StorageKey,
  StorageValueModes,
} from '@standardnotes/services'
import { SNRootKeyParams } from '../../RootKey/RootKeyParams'
import { CreateAnyKeyParams } from '../../RootKey/KeyParams'

export enum RootKeyServiceEvent {
  RootKeyStatusChanged = 'RootKeyStatusChanged',
}

export class RootKeyEncryptionService extends AbstractService<RootKeyServiceEvent> {
  private rootKey?: SNRootKey
  public keyMode = KeyMode.RootKeyNone
  public memoizedRootKeyParams?: SNRootKeyParams

  constructor(
    private itemManager: ItemManagerInterface,
    private operatorManager: OperatorManager,
    public deviceInterface: DeviceInterface,
    private storageService: StorageServiceInterface,
    private identifier: ApplicationIdentifier,
    protected internalEventBus: InternalEventBusInterface,
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
    return passcodeParams.version !== ProtocolVersionLatest
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

  public async getEncryptionSourceVersion(): Promise<ProtocolVersion> {
    if (this.hasAccount()) {
      return this.getSureUserVersion()
    } else if (this.hasPasscode()) {
      const passcodeParams = await this.getSureRootKeyWrapperKeyParams()
      return passcodeParams.version
    }

    throw Error('Attempting to access encryption source version without source')
  }

  public getUserVersion(): ProtocolVersion | undefined {
    const keyParams = this.memoizedRootKeyParams
    return keyParams?.version
  }

  private getSureUserVersion(): ProtocolVersion {
    const keyParams = this.memoizedRootKeyParams as SNRootKeyParams
    return keyParams.version
  }

  private async getRootKeyFromKeychain() {
    const rawKey = await this.deviceInterface.getNamespacedKeychainValue(this.identifier)
    if (rawKey == undefined) {
      return undefined
    }
    const rootKey = SNRootKey.Create({
      ...rawKey,
      keyParams: await this.getRootKeyParams(),
    })
    return rootKey
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
      StorageKey.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped,
    )

    if (!rawKeyParams) {
      return undefined
    }

    return CreateAnyKeyParams(rawKeyParams as AnyKeyParamsContent)
  }

  public async getSureRootKeyWrapperKeyParams() {
    return this.getRootKeyWrapperKeyParams() as Promise<SNRootKeyParams>
  }

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

  public async computeRootKey(password: string, keyParams: SNRootKeyParams) {
    const version = keyParams.version
    const operator = this.operatorManager.operatorForVersion(version)
    return operator.computeRootKey(password, keyParams)
  }

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
    const wrappedRootKey = (await this.getWrappedRootKey()) as RawPayload

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
      const decrypted = await this.decryptPayload(wrappedKeyPayload, wrappingKey)
      return !decrypted.errorDecrypting
    } else {
      throw 'Unhandled case in validateWrappingKey'
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

    this.memoizedRootKeyParams = CreateAnyKeyParams(rawKeyParams as AnyKeyParamsContent)
    return this.memoizedRootKeyParams
  }

  /**
   * Wraps the current in-memory root key value using the wrappingKey,
   * then persists the wrapped value to disk.
   */
  private async wrapAndPersistRootKey(wrappingKey: SNRootKey) {
    const payload = CreateMaxPayloadFromAnyObject(this.getSureRootKey(), {
      content: this.getSureRootKey().persistableValueWhenWrapping(),
    })

    const wrappedKey = await this.encryptSplitSingle(payload, wrappingKey)
    const wrappedKeyPayload = mergePayloadWithEncryptionParameters(payload, wrappedKey)

    this.storageService.setValue(
      StorageKey.WrappedRootKey,
      wrappedKeyPayload.ejected(),
      StorageValueModes.Nonwrapped,
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

    const wrappedKey = (await this.getWrappedRootKey()) as RawPayload
    const payload = CreateMaxPayloadFromAnyObject(wrappedKey)
    const decrypted = await this.decryptPayload(payload, wrappingKey)

    if (decrypted.errorDecrypting) {
      throw Error('Unable to decrypt root key with provided wrapping key.')
    } else {
      const decryptedPayload = mergePayloadWithEncryptionParameters(payload, decrypted)
      this.setRootKeyInstance(
        SNRootKey.Create(
          decryptedPayload.contentObject as unknown as RootKeyContent,
          decryptedPayload.uuid,
        ),
      )
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
        StorageKey.RootKeyWrapperKeyParams,
        wrappingKey.keyParams.getPortableValue(),
        StorageValueModes.Nonwrapped,
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

    await this.storageService.removeValue(StorageKey.WrappedRootKey, StorageValueModes.Nonwrapped)
    await this.storageService.removeValue(
      StorageKey.RootKeyWrapperKeyParams,
      StorageValueModes.Nonwrapped,
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

    await this.handleKeyStatusChange()
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
    this.setRootKeyInstance(undefined)

    await this.handleKeyStatusChange()
  }

  private getWrappedRootKey() {
    return this.storageService.getValue(StorageKey.WrappedRootKey, StorageValueModes.Nonwrapped)
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

  public async encryptSplitSingleWithKeyLookup(payload: PurePayload): Promise<EncryptedParameters> {
    const key = this.getRootKey()

    if (key == undefined) {
      throw Error('Attempting root key encryption with no root key')
    }

    return this.encryptSplitSingle(payload, key)
  }

  public async encryptSplitSinglesWithKeyLookup(
    payloads: PurePayload[],
  ): Promise<EncryptedParameters[]> {
    return Promise.all(payloads.map((payload) => this.encryptSplitSingleWithKeyLookup(payload)))
  }

  public async encryptSplitSingle(
    payload: PurePayload,
    key: SNRootKey,
  ): Promise<EncryptedParameters> {
    return OperatorWrapper.encryptPayload(payload, key, this.operatorManager)
  }

  public async encryptSplitSingles(payloads: PurePayload[], key: SNRootKey) {
    return Promise.all(payloads.map((payload) => this.encryptSplitSingle(payload, key)))
  }

  public async decryptPayloadWithKeyLookup(
    payload: PurePayload,
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

  public async decryptPayload(
    payload: PurePayload,
    key: SNRootKey,
  ): Promise<DecryptedParameters | ErroredDecryptingParameters> {
    return OperatorWrapper.decryptPayload(payload, key, this.operatorManager)
  }

  public async decryptPayloadsWithKeyLookup(
    payloads: PurePayload[],
  ): Promise<(DecryptedParameters | ErroredDecryptingParameters)[]> {
    return Promise.all(payloads.map((payload) => this.decryptPayloadWithKeyLookup(payload)))
  }

  public async decryptPayloads(
    payloads: PurePayload[],
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
      await this.itemManager.setItemsDirty(Uuids(itemsKeys))
    }
  }

  /**
   * Creates a new random SNItemsKey to use for item encryption, and adds it to model management.
   * Consumer must call sync. If the protocol version <= 003, only one items key should be created,
   * and its .itemsKey value should be equal to the root key masterKey value.
   */
  public async createNewDefaultItemsKey(): Promise<SNItemsKey> {
    const rootKey = this.rootKey as SNRootKey
    const operatorVersion = rootKey ? rootKey.keyVersion : ProtocolVersionLatest
    let itemTemplate: SNItemsKey

    if (compareVersions(operatorVersion, ProtocolVersionLastNonrootItemsKey) <= 0) {
      /** Create root key based items key */
      const payload = CreateMaxPayloadFromAnyObject({
        uuid: UuidGenerator.GenerateUuid(),
        content_type: ContentType.ItemsKey,
        content: FillItemContent({
          itemsKey: rootKey.masterKey,
          dataAuthenticationKey: rootKey.dataAuthenticationKey,
          version: operatorVersion,
        }),
      })
      itemTemplate = CreateItemFromPayload(payload) as SNItemsKey
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

    const itemsKey = (await this.itemManager.insertItem(itemTemplate)) as SNItemsKey
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

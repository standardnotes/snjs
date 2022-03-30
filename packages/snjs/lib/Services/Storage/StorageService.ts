import { SNLog } from '../../log'
import { Environment } from '@Lib/Application/platforms'
import { ApplicationStage, EncryptionIntent } from '@standardnotes/applications'
import {
  CreateMaxPayloadFromAnyObject,
  PayloadContent,
  RawPayload,
  PurePayload,
  CreateIntentPayloadFromObject,
} from '@standardnotes/payloads'
import { ContentType } from '@standardnotes/common'
import { Copy, extendArray, isNullOrUndefined, UuidGenerator } from '@standardnotes/utils'
import {
  AbstractService,
  DeviceInterface,
  InternalEventBusInterface,
  StorageServiceInterface,
  StoragePersistencePolicies,
  StorageEncryptionPolicy,
  StorageValuesObject,
  ValueModesKeys,
  StorageValueModes,
  ValuesObjectRecord,
  RawStorageKey,
  StorageKey,
  namespacedKey,
} from '@standardnotes/services'
import {
  createKeyLookupSplitFromSplit,
  EncryptionSplitWithKey,
  splitItemsByEncryptionType,
} from '../Protocol/EncryptionSplit'
import { EncryptionProvider } from '../Protocol/EncryptionProvider'
import { RootKeyInterface } from '@standardnotes/models'
import { SNRootKey } from '@standardnotes/encryption'

/**
 * The storage service is responsible for persistence of both simple key-values, and payload
 * storage. It does so by relying on deviceInterface to save and retrieve raw values and payloads.
 * For simple key/values, items are grouped together in an in-memory hash, and persisted to disk
 * as a single object (encrypted, when possible). It handles persisting payloads in the local
 * database by encrypting the payloads when possible.
 * The storage service also exposes methods that allow the application to initially
 * decrypt the persisted key/values, and also a method to determine whether a particular
 * key can decrypt wrapped storage.
 */
export class SNStorageService extends AbstractService implements StorageServiceInterface {
  private encryptionProvider!: EncryptionProvider
  private storagePersistable = false
  private persistencePolicy!: StoragePersistencePolicies
  private encryptionPolicy!: StorageEncryptionPolicy
  private needsPersist = false
  private currentPersistPromise?: Promise<StorageValuesObject>

  private values!: StorageValuesObject

  constructor(
    private deviceInterface: DeviceInterface,
    private identifier: string,
    private environment: Environment,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
    void this.setPersistencePolicy(StoragePersistencePolicies.Default)
    void this.setEncryptionPolicy(StorageEncryptionPolicy.Default, false)
  }

  public provideEncryptionProvider(provider: EncryptionProvider): void {
    this.encryptionProvider = provider
  }

  public deinit() {
    ;(this.deviceInterface as unknown) = undefined
    ;(this.encryptionProvider as unknown) = undefined
    this.storagePersistable = false
    super.deinit()
  }

  async handleApplicationStage(stage: ApplicationStage) {
    await super.handleApplicationStage(stage)
    if (stage === ApplicationStage.Launched_10) {
      this.storagePersistable = true
      if (this.needsPersist) {
        void this.persistValuesToDisk()
      }
    } else if (stage === ApplicationStage.StorageDecrypted_09) {
      const persistedPolicy = await this.getValue(StorageKey.StorageEncryptionPolicy)
      if (persistedPolicy) {
        void this.setEncryptionPolicy(persistedPolicy as StorageEncryptionPolicy, false)
      }
    }
  }

  public async setPersistencePolicy(persistencePolicy: StoragePersistencePolicies) {
    this.persistencePolicy = persistencePolicy

    if (this.persistencePolicy === StoragePersistencePolicies.Ephemeral) {
      await this.deviceInterface.removeAllRawStorageValues()
      await this.clearAllPayloads()
    }
  }

  public setEncryptionPolicy(encryptionPolicy: StorageEncryptionPolicy, persist = true) {
    if (
      encryptionPolicy === StorageEncryptionPolicy.Disabled &&
      this.environment !== Environment.Mobile
    ) {
      throw Error('Disabling storage encryption is only available on mobile.')
    }
    this.encryptionPolicy = encryptionPolicy
    if (persist) {
      this.setValue(StorageKey.StorageEncryptionPolicy, encryptionPolicy)
    }
  }

  public isEphemeralSession() {
    return this.persistencePolicy === StoragePersistencePolicies.Ephemeral
  }

  public async initializeFromDisk() {
    const value = await this.deviceInterface.getRawStorageValue(this.getPersistenceKey())
    const values = value ? JSON.parse(value as string) : undefined
    this.setInitialValues(values)
  }

  /**
   * Called by platforms with the value they load from disk,
   * after they handle initializeFromDisk
   */
  private setInitialValues(values?: StorageValuesObject) {
    const sureValues = values || this.defaultValuesObject()

    if (!sureValues[ValueModesKeys.Unwrapped]) {
      sureValues[ValueModesKeys.Unwrapped] = {}
    }

    this.values = sureValues
  }

  public isStorageWrapped() {
    const wrappedValue = this.values[ValueModesKeys.Wrapped]
    return !isNullOrUndefined(wrappedValue) && Object.keys(wrappedValue).length > 0
  }

  public async canDecryptWithKey(key: RootKeyInterface): Promise<boolean> {
    const wrappedValue = this.values[ValueModesKeys.Wrapped] as RawPayload
    const decryptedPayload = await this.decryptWrappedValue(wrappedValue, key)
    return !decryptedPayload.errorDecrypting
  }

  private async decryptWrappedValue(wrappedValue: RawPayload, key?: SNRootKey) {
    /**
     * The read content type doesn't matter, so long as we know it responds
     * to content type. This allows a more seamless transition when both web
     * and mobile used different content types for encrypted storage.
     */
    if (!wrappedValue?.content_type) {
      throw Error('Attempting to decrypt nonexistent wrapped value')
    }

    const payload = CreateMaxPayloadFromAnyObject(wrappedValue, {
      content_type: ContentType.EncryptedStorage,
    })

    const split: EncryptionSplitWithKey<PurePayload> = key
      ? {
          usesRootKey: {
            items: [payload],
            key: key,
          },
        }
      : {
          usesRootKeyWithKeyLookup: {
            items: [payload],
          },
        }

    const decryptedPayload = (await this.encryptionProvider.decryptSplit(split))[0]
    return decryptedPayload
  }

  public async decryptStorage() {
    const wrappedValue = this.values[ValueModesKeys.Wrapped] as RawPayload
    const decryptedPayload = await this.decryptWrappedValue(wrappedValue)

    if (decryptedPayload.errorDecrypting) {
      throw SNLog.error(Error('Unable to decrypt storage.'))
    }

    this.values[ValueModesKeys.Unwrapped] = Copy(decryptedPayload.contentObject)
  }

  /** @todo This function should be debounced. */
  private async persistValuesToDisk() {
    if (!this.storagePersistable) {
      this.needsPersist = true
      return
    }

    if (this.persistencePolicy === StoragePersistencePolicies.Ephemeral) {
      return
    }

    await this.currentPersistPromise

    this.needsPersist = false
    const values = await this.immediatelyPersistValuesToDisk()
    /** Save the persisted value so we have access to it in memory (for unit tests afawk) */
    this.values[ValueModesKeys.Wrapped] = values[ValueModesKeys.Wrapped]
  }

  public async awaitPersist(): Promise<void> {
    await this.currentPersistPromise
  }

  private async immediatelyPersistValuesToDisk(): Promise<StorageValuesObject> {
    this.currentPersistPromise = this.executeCriticalFunction(async () => {
      const values = await this.generatePersistableValues()

      const persistencePolicySuddenlyChanged =
        this.persistencePolicy === StoragePersistencePolicies.Ephemeral
      if (persistencePolicySuddenlyChanged) {
        return values
      }

      await this.deviceInterface?.setRawStorageValue(
        this.getPersistenceKey(),
        JSON.stringify(values),
      )

      return values
    })

    return this.currentPersistPromise
  }

  /**
   * Generates a payload that can be persisted to disk,
   * either as a plain object, or an encrypted item.
   */
  private async generatePersistableValues() {
    const rawContent = Object.assign({}, this.values) as Partial<StorageValuesObject>

    const valuesToWrap = rawContent[ValueModesKeys.Unwrapped]
    rawContent[ValueModesKeys.Unwrapped] = undefined

    const payload = CreateMaxPayloadFromAnyObject({
      uuid: UuidGenerator.GenerateUuid(),
      content: valuesToWrap as PayloadContent,
      content_type: ContentType.EncryptedStorage,
    })

    if (this.encryptionProvider.hasRootKeyEncryptionSource()) {
      const split: EncryptionSplitWithKey<PurePayload> = {
        usesRootKeyWithKeyLookup: {
          items: [payload],
        },
      }

      const encryptedPayload = await this.encryptionProvider.encryptSplitSingle(
        split,
        EncryptionIntent.LocalStorageEncrypted,
      )

      rawContent[ValueModesKeys.Wrapped] = encryptedPayload.ejected()
    } else {
      const packagedPayload = CreateIntentPayloadFromObject(
        payload,
        EncryptionIntent.LocalStorageDecrypted,
      )
      rawContent[ValueModesKeys.Wrapped] = packagedPayload.ejected()
    }

    return rawContent as StorageValuesObject
  }

  public setValue(key: string, value: unknown, mode = StorageValueModes.Default): void {
    this.setValueWithNoPersist(key, value, mode)
    void this.persistValuesToDisk()
  }

  public async setValueAndAwaitPersist(
    key: string,
    value: unknown,
    mode = StorageValueModes.Default,
  ): Promise<void> {
    this.setValueWithNoPersist(key, value, mode)
    await this.persistValuesToDisk()
  }

  private setValueWithNoPersist(
    key: string,
    value: unknown,
    mode = StorageValueModes.Default,
  ): void {
    if (!this.values) {
      throw Error(`Attempting to set storage key ${key} before loading local storage.`)
    }

    const domainKey = this.domainKeyForMode(mode)
    this.values[domainKey][key] = value
  }

  public getValue<T>(key: string, mode = StorageValueModes.Default, defaultValue?: T): T {
    if (!this.values) {
      throw Error(`Attempting to get storage key ${key} before loading local storage.`)
    }

    if (!this.values[this.domainKeyForMode(mode)]) {
      throw Error(`Storage domain mode not available ${mode} for key ${key}`)
    }

    const value = this.values[this.domainKeyForMode(mode)][key]

    return value != undefined ? (value as T) : (defaultValue as T)
  }

  public async removeValue(key: string, mode = StorageValueModes.Default): Promise<void> {
    if (!this.values) {
      throw Error(`Attempting to remove storage key ${key} before loading local storage.`)
    }

    const domain = this.values[this.domainKeyForMode(mode)]

    if (domain?.[key]) {
      delete domain[key]
      return this.persistValuesToDisk()
    }
  }

  public getStorageEncryptionPolicy() {
    return this.encryptionPolicy
  }

  /**
   * Default persistence key. Platforms can override as needed.
   */
  private getPersistenceKey() {
    return namespacedKey(this.identifier, RawStorageKey.StorageObject)
  }

  private defaultValuesObject(
    wrapped?: ValuesObjectRecord,
    unwrapped?: ValuesObjectRecord,
    nonwrapped?: ValuesObjectRecord,
  ) {
    return SNStorageService.defaultValuesObject(wrapped, unwrapped, nonwrapped)
  }

  public static defaultValuesObject(
    wrapped: ValuesObjectRecord = {},
    unwrapped: ValuesObjectRecord = {},
    nonwrapped: ValuesObjectRecord = {},
  ) {
    return {
      [ValueModesKeys.Wrapped]: wrapped,
      [ValueModesKeys.Unwrapped]: unwrapped,
      [ValueModesKeys.Nonwrapped]: nonwrapped,
    } as StorageValuesObject
  }

  private domainKeyForMode(mode: StorageValueModes) {
    if (mode === StorageValueModes.Default) {
      return ValueModesKeys.Unwrapped
    } else if (mode === StorageValueModes.Nonwrapped) {
      return ValueModesKeys.Nonwrapped
    } else {
      throw Error('Invalid mode')
    }
  }

  /**
   * Clears simple values from storage only. Does not affect payloads.
   */
  async clearValues() {
    this.setInitialValues()
    await this.immediatelyPersistValuesToDisk()
  }

  public async getAllRawPayloads() {
    return this.deviceInterface.getAllRawDatabasePayloads(this.identifier)
  }

  public async savePayload(payload: PurePayload): Promise<void> {
    return this.savePayloads([payload])
  }

  public async savePayloads(decryptedPayloads: PurePayload[]): Promise<void> {
    if (this.persistencePolicy === StoragePersistencePolicies.Ephemeral) {
      return
    }

    const categorizePayloads = (payloads: PurePayload[]) => {
      const encrypted = this.encryptionPolicy === StorageEncryptionPolicy.Default

      const plausiblyEncryptable: PurePayload[] = []
      const discardables: PurePayload[] = []
      const unencryptables: PurePayload[] = []

      for (const payload of payloads) {
        if (payload.discardable) {
          discardables.push(payload)
        } else {
          plausiblyEncryptable.push(payload)
        }
      }

      const encryptables: PurePayload[] = []
      if (encrypted) {
        const split = splitItemsByEncryptionType(plausiblyEncryptable)
        if (split.usesItemsKey) {
          extendArray(encryptables, split.usesItemsKey.items)
        }
        if (split.usesRootKey) {
          if (!this.encryptionProvider.hasRootKeyEncryptionSource()) {
            extendArray(unencryptables, split.usesRootKey.items)
          } else {
            extendArray(encryptables, split.usesRootKey.items)
          }
        }
      } else {
        extendArray(unencryptables, plausiblyEncryptable)
      }

      return { encryptables, unencryptables, discardables }
    }

    const { encryptables, unencryptables, discardables } = categorizePayloads(decryptedPayloads)
    await this.deletePayloads(discardables)

    const split = splitItemsByEncryptionType(encryptables)
    const keyLookupSplit = createKeyLookupSplitFromSplit(split)
    const encryptedPayloads = await this.encryptionProvider.encryptSplit(
      keyLookupSplit,
      EncryptionIntent.LocalStorageEncrypted,
    )

    const nonEncryptedPayloads = unencryptables.map((payload) =>
      CreateIntentPayloadFromObject(payload, EncryptionIntent.LocalStorageDecrypted),
    )

    const ejected = encryptedPayloads
      .concat(nonEncryptedPayloads)
      .map((payload) => payload.ejected())
    return this.executeCriticalFunction(async () => {
      return this.deviceInterface?.saveRawDatabasePayloads(ejected, this.identifier)
    })
  }

  public async deletePayloads(payloads: PurePayload[]) {
    await Promise.all(payloads.map((payload) => this.deletePayloadWithId(payload.uuid)))
  }

  public async deletePayloadWithId(id: string) {
    return this.executeCriticalFunction(async () => {
      return this.deviceInterface.removeRawDatabasePayloadWithId(id, this.identifier)
    })
  }

  public async clearAllPayloads() {
    return this.executeCriticalFunction(async () => {
      return this.deviceInterface.removeAllRawDatabasePayloads(this.identifier)
    })
  }

  public clearAllData(): Promise<void> {
    return this.executeCriticalFunction(async () => {
      await this.clearValues()
      await this.clearAllPayloads()
      await this.deviceInterface.removeRawStorageValue(
        namespacedKey(this.identifier, RawStorageKey.SnjsVersion),
      )
      await this.deviceInterface.removeRawStorageValue(this.getPersistenceKey())
    })
  }
}

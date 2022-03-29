import {
  PurePayload,
  CreateIntentPayloadFromObject,
  CreateMaxPayloadFromAnyObject,
  FillItemContent,
} from '@standardnotes/payloads'
import { Uuids } from '@Lib/Models/Functions'
import { ItemManager } from '@Lib/Services/Items/ItemManager'
import { CreateItemFromPayload } from '@Lib/Models/Generator'
import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { ItemsKeyMutator } from '@Lib/Models/ItemsKey/ItemsKeyMutator'
import { SNRootKey } from '@Lib/Protocol/root_key'
import { UuidGenerator, isString, isFunction } from '@standardnotes/utils'
import {
  ContentType,
  ProtocolVersionLatest,
  ProtocolVersionLastNonrootItemsKey,
} from '@standardnotes/common'
import { compareVersions, EncryptionIntent } from '@standardnotes/applications'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { findDefaultItemsKey, isAsyncOperator, payloadContentFormatForIntent } from './Functions'
import { OperatorManager } from './OperatorManager'

export class RootKeyEncryptionService extends AbstractService {
  private rootKey?: SNRootKey

  constructor(
    private itemManager: ItemManager,
    private operatorManager: OperatorManager,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  public setRootKey(rootKey: SNRootKey | undefined): void {
    this.rootKey = rootKey
  }

  public getRootKey(): SNRootKey | undefined {
    return this.rootKey
  }

  /** @override */
  public deinit(): void {
    ;(this.itemManager as unknown) = undefined
    this.rootKey = undefined
    super.deinit()
  }

  private getItemsKeys() {
    return this.itemManager.itemsKeys()
  }

  public async encryptPayloads(
    payloads: PurePayload[],
    intent: EncryptionIntent | ((payload: PurePayload) => EncryptionIntent),
    key: SNRootKey,
  ) {
    const results = []
    for (const payload of payloads) {
      const useIntent = isFunction(intent) ? (intent as any)(payload) : intent
      const encryptedPayload = await this.encryptPayload(payload, useIntent, key)
      results.push(encryptedPayload)
    }
    return results
  }

  public async encryptPayload(
    payload: PurePayload,
    intent: EncryptionIntent,
    key?: SNRootKey,
  ): Promise<PurePayload> {
    const format = payloadContentFormatForIntent(intent, key)
    const operator = this.operatorManager.operatorForVersion(
      key?.keyVersion || ProtocolVersionLatest,
    )
    let encryptionParameters
    if (isAsyncOperator(operator)) {
      encryptionParameters = await operator.generateEncryptedParametersAsync(payload, format, key)
    } else {
      encryptionParameters = operator.generateEncryptedParametersSync(payload, format, key)
    }
    if (!encryptionParameters) {
      throw 'Unable to generate encryption parameters'
    }
    const result = CreateIntentPayloadFromObject(payload, intent, encryptionParameters)
    return result
  }

  public async decryptPayload(payload: PurePayload, key: SNRootKey): Promise<PurePayload> {
    const version = payload.version!
    const source = payload.source
    const operator = this.operatorManager.operatorForVersion(version)
    try {
      let decryptedParameters
      if (isAsyncOperator(operator)) {
        decryptedParameters = await operator.generateDecryptedParametersAsync(payload, key)
      } else {
        decryptedParameters = operator.generateDecryptedParametersSync(payload, key) as PurePayload
      }
      return CreateMaxPayloadFromAnyObject(payload, decryptedParameters, source)
    } catch (e) {
      console.error('Error decrypting payload', payload, e)
      return CreateMaxPayloadFromAnyObject(payload, {
        errorDecrypting: true,
        errorDecryptingValueChanged: !payload.errorDecrypting,
      })
    }
  }

  public async decryptPayloads(payloads: PurePayload[], key: SNRootKey): Promise<PurePayload[]> {
    const decryptItem = (encryptedPayload: PurePayload) => {
      if (!encryptedPayload) {
        /** Keep in-counts similar to out-counts */
        return encryptedPayload
      }
      /**
       * We still want to decrypt deleted payloads if they have content in case
       * they were marked as dirty but not yet synced.
       */
      if (encryptedPayload.deleted === true && encryptedPayload.content == undefined) {
        return encryptedPayload
      }
      const isDecryptable = isString(encryptedPayload.content)
      if (!isDecryptable) {
        return encryptedPayload
      }
      return this.decryptPayload(encryptedPayload, key)
    }

    return Promise.all(payloads.map((payload) => decryptItem(payload)))
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
      await Promise.all([
        this.itemManager.setItemToBeDeleted(newDefaultItemsKey.uuid),
        this.itemManager.changeItem<ItemsKeyMutator>(currentDefaultItemsKey!.uuid, (mutator) => {
          mutator.isDefault = true
        }),
      ])
    }
    return rollback
  }
}

import {
  PurePayload,
  CreateMaxPayloadFromAnyObject,
  FillItemContent,
} from '@standardnotes/payloads'
import { Uuids } from '@Lib/Models/Functions'
import { ItemManager } from '@Lib/Services/Items/ItemManager'
import { CreateItemFromPayload } from '@Lib/Models/Generator'
import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { ItemsKeyMutator } from '@Lib/Models/ItemsKey/ItemsKeyMutator'
import { SNRootKey } from '@Lib/Protocol/root_key'
import { UuidGenerator } from '@standardnotes/utils'
import {
  ContentType,
  ProtocolVersionLatest,
  ProtocolVersionLastNonrootItemsKey,
} from '@standardnotes/common'
import { compareVersions } from '@standardnotes/applications'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { findDefaultItemsKey } from './Functions'
import { OperatorManager } from './OperatorManager'
import * as OperatorWrapper from './OperatorWrapper'

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

  public deinit(): void {
    ;(this.itemManager as unknown) = undefined
    this.rootKey = undefined
    super.deinit()
  }

  private getItemsKeys() {
    return this.itemManager.itemsKeys()
  }

  public async encryptPayloadWithKeyLookup(payload: PurePayload): Promise<PurePayload> {
    const key = this.getRootKey()

    if (key == undefined) {
      throw Error('Attempting root key encryption with no root key')
    }

    return this.encryptPayload(payload, key)
  }

  public async encryptPayloadsWithKeyLookup(payloads: PurePayload[]): Promise<PurePayload[]> {
    return Promise.all(payloads.map((payload) => this.encryptPayloadWithKeyLookup(payload)))
  }

  public async encryptPayload(payload: PurePayload, key: SNRootKey): Promise<PurePayload> {
    return OperatorWrapper.encryptPayload(payload, key, this.operatorManager)
  }

  public async encryptPayloads(payloads: PurePayload[], key: SNRootKey) {
    return Promise.all(payloads.map((payload) => this.encryptPayload(payload, key)))
  }

  public async decryptPayloadWithKeyLookup(payload: PurePayload): Promise<PurePayload> {
    const key = this.getRootKey()

    if (key == undefined) {
      return CreateMaxPayloadFromAnyObject(payload, {
        errorDecrypting: true,
        waitingForKey: true,
      })
    }

    return this.decryptPayload(payload, key)
  }

  public async decryptPayload(payload: PurePayload, key: SNRootKey): Promise<PurePayload> {
    return OperatorWrapper.decryptPayload(payload, key, this.operatorManager)
  }

  public async decryptPayloadsWithKeyLookup(payloads: PurePayload[]): Promise<PurePayload[]> {
    return Promise.all(payloads.map((payload) => this.decryptPayloadWithKeyLookup(payload)))
  }

  public async decryptPayloads(payloads: PurePayload[], key: SNRootKey): Promise<PurePayload[]> {
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

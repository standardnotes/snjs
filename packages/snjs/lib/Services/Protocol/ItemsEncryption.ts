import { StandardException } from './StandardException'
import { OperatorManager } from './OperatorManager'
import { SNLog } from '../../log'
import {
  PurePayload,
  CreateMaxPayloadFromAnyObject,
  PayloadFormat,
  PayloadSource,
} from '@standardnotes/payloads'
import { ItemManager } from '@Lib/Services/Items/ItemManager'
import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { SNStorageService } from '../Storage/StorageService'
import { PayloadManager } from '../Payloads/PayloadManager'
import { ContentType, ProtocolVersion, ProtocolVersionLatest } from '@standardnotes/common'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { findDefaultItemsKey } from './Functions'
import * as OperatorWrapper from './OperatorWrapper'

export class ItemsEncryptionService extends AbstractService {
  private removeItemsObserver!: () => void
  public userVersion?: ProtocolVersion

  constructor(
    private itemManager: ItemManager,
    private payloadManager: PayloadManager,
    private storageService: SNStorageService,
    private operatorManager: OperatorManager,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)

    this.removeItemsObserver = this.itemManager.addObserver(
      [ContentType.ItemsKey],
      (changed, inserted) => {
        if (changed.concat(inserted).length > 0) {
          void this.decryptErroredItems()
        }
      },
    )
  }

  /** @override */
  public deinit(): void {
    ;(this.itemManager as unknown) = undefined
    ;(this.payloadManager as unknown) = undefined
    ;(this.storageService as unknown) = undefined
    this.removeItemsObserver()
    ;(this.removeItemsObserver as unknown) = undefined
    super.deinit()
  }

  /**
   * If encryption status changes (esp. on mobile, where local storage encryption
   * can be disabled), consumers may call this function to repersist all items to
   * disk using latest encryption status.
   * @access public
   */
  async repersistAllItems() {
    const items = this.itemManager.items
    const payloads = items.map((item) => CreateMaxPayloadFromAnyObject(item))
    return this.storageService.savePayloads(payloads)
  }

  public getItemsKeys() {
    return this.itemManager.itemsKeys()
  }

  public itemsKeyForPayload(payload: PurePayload) {
    return this.getItemsKeys().find(
      (key) => key.uuid === payload.items_key_id || key.duplicateOf === payload.items_key_id,
    )
  }

  public getDefaultItemsKey(): SNItemsKey | undefined {
    return findDefaultItemsKey(this.getItemsKeys())
  }

  private keyToUseForItemEncryption(): SNItemsKey | StandardException {
    const defaultKey = this.getDefaultItemsKey()
    let result: SNItemsKey | undefined = undefined

    if (this.userVersion && this.userVersion !== defaultKey?.keyVersion) {
      /**
       * The default key appears to be either newer or older than the user's account version
       * We could throw an exception here, but will instead fall back to a corrective action:
       * return any items key that corresponds to the user's version
       */
      const itemsKeys = this.getItemsKeys()
      result = itemsKeys.find((key) => key.keyVersion === this.userVersion)
    } else {
      result = defaultKey
    }

    if (!result) {
      return new StandardException('Cannot find items key to use for encryption')
    }

    return result
  }

  private keyToUseForDecryptionOfPayload(payload: PurePayload): SNItemsKey | StandardException {
    if (payload.items_key_id) {
      const itemsKey = this.itemsKeyForPayload(payload)
      if (!itemsKey) {
        return new StandardException('Cannot find items key to use for decryption')
      }
      return itemsKey
    }

    const payloadVersion = payload.version!
    if (payloadVersion === ProtocolVersionLatest) {
      return new StandardException(
        'No associated key found for item encrypted with latest protocol version.',
      )
    }

    const defaultKey = this.defaultItemsKeyForItemVersion(payloadVersion)
    if (!defaultKey) {
      return new StandardException('Cannot find key to use for decryption of payload')
    }
    return defaultKey
  }

  public async encryptPayloadWithKeyLookup(payload: PurePayload): Promise<PurePayload> {
    const key = this.keyToUseForItemEncryption()

    if (key instanceof StandardException) {
      throw Error(key.message)
    }

    return this.encryptPayload(payload, key)
  }

  public async encryptPayload(payload: PurePayload, key: SNItemsKey): Promise<PurePayload> {
    if (payload.errorDecrypting) {
      return payload
    }
    if (payload.deleted) {
      return payload
    }
    if (payload.format !== PayloadFormat.DecryptedBareObject) {
      throw Error('Attempting to encrypt already encrypted payload.')
    }
    if (!payload.content) {
      throw Error('Attempting to encrypt payload with no content.')
    }
    if (!payload.uuid) {
      throw Error('Attempting to encrypt payload with no UuidGenerator.')
    }
    if (key.errorDecrypting || key.waitingForKey) {
      throw Error('Attempting to encrypt payload with encrypted key.')
    }

    return OperatorWrapper.encryptPayload(payload, key, this.operatorManager)
  }

  public async encryptPayloads(payloads: PurePayload[], key: SNItemsKey) {
    return Promise.all(payloads.map((payload) => this.encryptPayload(payload, key)))
  }

  public async encryptPayloadsWithKeyLookup(payloads: PurePayload[]): Promise<PurePayload[]> {
    return Promise.all(payloads.map((payload) => this.encryptPayloadWithKeyLookup(payload)))
  }

  public async decryptPayloadWithKeyLookup(payload: PurePayload): Promise<PurePayload> {
    const key = this.keyToUseForDecryptionOfPayload(payload)

    if (key instanceof StandardException) {
      return CreateMaxPayloadFromAnyObject(payload, {
        errorDecrypting: true,
        waitingForKey: true,
      })
    }

    return this.decryptPayload(payload, key)
  }

  public async decryptPayload(payload: PurePayload, key: SNItemsKey): Promise<PurePayload> {
    if (payload.deleted === true && payload.content === undefined) {
      return payload
    }

    if (!payload.content) {
      SNLog.error(Error('Attempting to decrypt payload that has no content.'))
      return CreateMaxPayloadFromAnyObject(payload, {
        errorDecrypting: true,
      })
    }

    const format = payload.format
    if (format === PayloadFormat.DecryptedBareObject) {
      return payload
    }

    if (key.errorDecrypting) {
      return CreateMaxPayloadFromAnyObject(payload, {
        waitingForKey: true,
        errorDecrypting: true,
      })
    }

    return OperatorWrapper.decryptPayload(payload, key, this.operatorManager)
  }

  public async decryptPayloadsWithKeyLookup(payloads: PurePayload[]): Promise<PurePayload[]> {
    return Promise.all(payloads.map((payload) => this.decryptPayloadWithKeyLookup(payload)))
  }

  public async decryptPayloads(payloads: PurePayload[], key: SNItemsKey): Promise<PurePayload[]> {
    return Promise.all(payloads.map((payload) => this.decryptPayload(payload, key)))
  }

  public async decryptErroredItems() {
    const items = this.itemManager.invalidItems.filter(
      (i) => i.content_type !== ContentType.ItemsKey,
    )
    if (items.length === 0) {
      return
    }

    const payloads = items.map((item) => {
      return item.payloadRepresentation()
    })

    const decrypted = await this.decryptPayloadsWithKeyLookup(payloads)

    await this.payloadManager.emitPayloads(decrypted, PayloadSource.LocalChanged)
  }

  /**
   * When migrating from non-SNItemsKey architecture, many items will not have a
   * relationship with any key object. For those items, we can be sure that only 1 key
   * object will correspond to that protocol version.
   * @returns The SNItemsKey object to decrypt items encrypted
   * with previous protocol version.
   */
  public defaultItemsKeyForItemVersion(
    version: ProtocolVersion,
    fromKeys?: SNItemsKey[],
  ): SNItemsKey | undefined {
    /** Try to find one marked default first */
    const searchKeys = fromKeys || this.getItemsKeys()
    const priorityKey = searchKeys.find((key) => {
      return key.isDefault && key.keyVersion === version
    })
    if (priorityKey) {
      return priorityKey
    }
    return searchKeys.find((key) => {
      return key.keyVersion === version
    })
  }
}

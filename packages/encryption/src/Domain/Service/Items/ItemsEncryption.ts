import { ContentType, ProtocolVersion } from '@standardnotes/common'
import { findDefaultItemsKey } from '../Functions'
import { OperatorManager } from '../../Operator/OperatorManager'
import { StandardException } from '../../StandardException'
import * as OperatorWrapper from '../../Operator/OperatorWrapper'
import * as Models from '@standardnotes/models'
import * as Services from '@standardnotes/services'
import {
  DecryptedParameters,
  EncryptedParameters,
  ErroredDecryptingParameters,
} from '../../Encryption/EncryptedParameters'

export class ItemsEncryptionService extends Services.AbstractService {
  private removeItemsObserver!: () => void
  public userVersion?: ProtocolVersion

  constructor(
    private itemManager: Services.ItemManagerInterface,
    private payloadManager: Services.PayloadManagerInterface,
    private storageService: Services.StorageServiceInterface,
    private operatorManager: OperatorManager,
    protected internalEventBus: Services.InternalEventBusInterface,
  ) {
    super(internalEventBus)

    this.removeItemsObserver = this.itemManager.addObserver(
      [ContentType.ItemsKey],
      (changed, inserted) => {
        if (changed.concat(inserted).length > 0) {
          void this.decryptErroredPayloads()
        }
      },
    )
  }

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
   */
  async repersistAllItems() {
    const items = this.itemManager.allItems()
    const payloads = items.map((item) => new Models.DecryptedPayload(item.payload.ejected()))
    return this.storageService.savePayloads(payloads)
  }

  public getItemsKeys() {
    return this.itemManager.itemsKeys()
  }

  public itemsKeyForPayload(
    payload: Models.EncryptedPayloadInterface,
  ): Models.ItemsKeyInterface | undefined {
    return this.getItemsKeys().find(
      (key) => key.uuid === payload.items_key_id || key.duplicateOf === payload.items_key_id,
    )
  }

  public getDefaultItemsKey(): Models.ItemsKeyInterface | undefined {
    return findDefaultItemsKey(this.getItemsKeys())
  }

  private keyToUseForItemEncryption(): Models.ItemsKeyInterface | StandardException {
    const defaultKey = this.getDefaultItemsKey()
    let result: Models.ItemsKeyInterface | undefined = undefined

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

  private keyToUseForDecryptionOfPayload(
    payload: Models.EncryptedPayloadInterface,
  ): Models.ItemsKeyInterface | undefined {
    if (payload.items_key_id) {
      const itemsKey = this.itemsKeyForPayload(payload)
      return itemsKey
    }

    const defaultKey = this.defaultItemsKeyForItemVersion(payload.version)
    return defaultKey
  }

  public async encryptPayloadWithKeyLookup(
    payload: Models.DecryptedPayloadInterface,
  ): Promise<EncryptedParameters> {
    const key = this.keyToUseForItemEncryption()

    if (key instanceof StandardException) {
      throw Error(key.message)
    }

    return this.encryptPayload(payload, key)
  }

  public async encryptPayload(
    payload: Models.DecryptedPayloadInterface,
    key: Models.ItemsKeyInterface,
  ): Promise<EncryptedParameters> {
    if (payload.format !== Models.PayloadFormat.DecryptedBareObject) {
      throw Error('Attempting to encrypt already encrypted payload.')
    }
    if (!payload.content) {
      throw Error('Attempting to encrypt payload with no content.')
    }
    if (!payload.uuid) {
      throw Error('Attempting to encrypt payload with no UuidGenerator.')
    }

    return OperatorWrapper.encryptPayload(payload, key, this.operatorManager)
  }

  public async encryptPayloads(
    payloads: Models.DecryptedPayloadInterface[],
    key: Models.ItemsKeyInterface,
  ): Promise<EncryptedParameters[]> {
    return Promise.all(payloads.map((payload) => this.encryptPayload(payload, key)))
  }

  public async encryptPayloadsWithKeyLookup(
    payloads: Models.DecryptedPayloadInterface[],
  ): Promise<EncryptedParameters[]> {
    return Promise.all(payloads.map((payload) => this.encryptPayloadWithKeyLookup(payload)))
  }

  public async decryptPayloadWithKeyLookup(
    payload: Models.EncryptedPayloadInterface,
  ): Promise<DecryptedParameters | ErroredDecryptingParameters> {
    const key = this.keyToUseForDecryptionOfPayload(payload)

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
    payload: Models.EncryptedPayloadInterface,
    key: Models.ItemsKeyInterface,
  ): Promise<DecryptedParameters | ErroredDecryptingParameters> {
    if (!payload.content) {
      return {
        uuid: payload.uuid,
        errorDecrypting: true,
      }
    }

    return OperatorWrapper.decryptPayload(payload, key, this.operatorManager)
  }

  public async decryptPayloadsWithKeyLookup(
    payloads: Models.EncryptedPayloadInterface[],
  ): Promise<(DecryptedParameters | ErroredDecryptingParameters)[]> {
    return Promise.all(payloads.map((payload) => this.decryptPayloadWithKeyLookup(payload)))
  }

  public async decryptPayloads(
    payloads: Models.EncryptedPayloadInterface[],
    key: Models.ItemsKeyInterface,
  ): Promise<(DecryptedParameters | ErroredDecryptingParameters)[]> {
    return Promise.all(payloads.map((payload) => this.decryptPayload(payload, key)))
  }

  public async decryptErroredPayloads(): Promise<void> {
    const items = this.itemManager.invalidItems.filter(
      (i) => i.content_type !== ContentType.ItemsKey,
    )
    if (items.length === 0) {
      return
    }

    const payloads = items.map((item) => {
      return item.payloadRepresentation()
    })

    const decryptedParams = await this.decryptPayloadsWithKeyLookup(payloads)
    const decryptedPayloads = decryptedParams.map((decryptedParam) => {
      const originalPayload = Models.sureFindPayload(decryptedParam.uuid, payloads)
      return mergePayloadWithEncryptionParameters(originalPayload, decryptedParam)
    })

    await this.payloadManager.emitPayloads(decryptedPayloads, Models.PayloadSource.LocalChanged)
  }

  /**
   * When migrating from non-items key architecture, many items will not have a
   * relationship with any key object. For those items, we can be sure that only 1 key
   * object will correspond to that protocol version.
   * @returns The items key object to decrypt items encrypted
   * with previous protocol version.
   */
  public defaultItemsKeyForItemVersion(
    version: ProtocolVersion,
    fromKeys?: Models.ItemsKeyInterface[],
  ): Models.ItemsKeyInterface | undefined {
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

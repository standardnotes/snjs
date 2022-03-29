import { OperatorManager } from './OperatorManager'
import { SNLog } from '../../log'
import {
  PurePayload,
  CreateIntentPayloadFromObject,
  CreateMaxPayloadFromAnyObject,
  PayloadFormat,
  PayloadSource,
} from '@standardnotes/payloads'
import { ItemManager } from '@Lib/Services/Items/ItemManager'
import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { SNStorageService } from '../Storage/StorageService'
import { PayloadManager } from '../Payloads/PayloadManager'
import { isFunction, isNullOrUndefined, isString } from '@standardnotes/utils'
import { ContentType, ProtocolVersion, ProtocolVersionLatest } from '@standardnotes/common'
import {
  EncryptionIntent,
  intentRequiresEncryption,
  isDecryptedIntent,
} from '@standardnotes/applications'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { findDefaultItemsKey, isAsyncOperator, payloadContentFormatForIntent } from './Functions'

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
  /**
   * Determines which key to use for encryption of the payload
   * The key object to use for encrypting the payload.
   */
  private keyToUseForItemEncryption() {
    const defaultKey = this.getDefaultItemsKey()

    if (this.userVersion && this.userVersion !== defaultKey?.keyVersion) {
      /**
       * The default key appears to be either newer or older than the user's account version
       * We could throw an exception here, but will instead fall back to a corrective action:
       * return any items key that corresponds to the user's version
       */
      const itemsKeys = this.getItemsKeys()
      return itemsKeys.find((key) => key.keyVersion === this.userVersion)
    } else {
      return defaultKey
    }
  }

  /**
   * Payloads could have been previously encrypted with any arbitrary SNItemsKey object.
   * If the payload is an items key object, it is always encrypted with the root key,
   * and so return that. Otherwise, we check to see if the payload has an
   * items_key_id and return that key. If it doesn't, this means the payload was
   * encrypted with legacy behavior. We return then the key object corresponding
   * to the version of this payload.
   * @returns The key object to use for decrypting this payload.
   */
  private keyToUseForDecryptionOfPayload(payload: PurePayload): SNItemsKey | undefined {
    if (payload.items_key_id) {
      const itemsKey = this.itemsKeyForPayload(payload)
      return itemsKey
    }

    const payloadVersion = payload.version!
    if (payloadVersion === ProtocolVersionLatest) {
      SNLog.error(Error('No associated key found for item encrypted with latest protocol version.'))
      return undefined
    }

    return this.defaultItemsKeyForItemVersion(payloadVersion)
  }

  /**
   * Generates parameters for a payload that are typically encrypted, and used for syncing
   * or saving locally. Parameters are non-typed objects that can later by converted to objects.
   * If the input payload is not properly decrypted in the first place, it will be returned
   * as-is. If the payload is deleted, it will be returned as-is (assuming that the content field is null)
   * @param payload - The payload to encrypt
   * @param key The key to use to encrypt the payload.
   *   Will be looked up if not supplied.
   * @param intent - The target of the encryption
   * @returns The encrypted payload
   */
  public async encryptPayload(
    payload: PurePayload,
    intent: EncryptionIntent,
    key?: SNItemsKey,
  ): Promise<PurePayload> {
    if (payload.errorDecrypting) {
      return payload
    }
    if (payload.deleted) {
      return payload
    }
    if (isNullOrUndefined(intent)) {
      throw Error('Attempting to encrypt payload with null intent')
    }
    if (!key && !isDecryptedIntent(intent)) {
      key = this.keyToUseForItemEncryption()
    }
    if (!key && intentRequiresEncryption(intent)) {
      throw Error('Attempting to generate encrypted payload with no key.')
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
    if (key?.errorDecrypting || key?.waitingForKey) {
      throw Error('Attempting to encrypt payload with encrypted key.')
    }
    const version = key ? key.keyVersion : ProtocolVersionLatest
    const format = payloadContentFormatForIntent(intent, key)
    const operator = this.operatorManager.operatorForVersion(version)
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

  /**
   * Similar to `encryptPayload`, but operates on an array of payloads.
   * `intent` can also be a function of the current iteration payload.
   */
  public async encryptPayloads(
    payloads: PurePayload[],
    intent: EncryptionIntent | ((payload: PurePayload) => EncryptionIntent),
    key?: SNItemsKey,
  ) {
    const results = []
    for (const payload of payloads) {
      const useIntent = isFunction(intent) ? (intent as any)(payload) : intent
      const encryptedPayload = await this.encryptPayload(payload, useIntent, key)
      results.push(encryptedPayload)
    }
    return results
  }

  /**
   * Generates a new payload by decrypting the input payload.
   * If the input payload is already decrypted, it will be returned as-is.
   * @param payload - The payload to decrypt.
   * @param key The key to use to decrypt the payload.
   * If none is supplied, it will be automatically looked up.
   */
  public async decryptPayload(payload: PurePayload, key?: SNItemsKey): Promise<PurePayload> {
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

    if (!key && format === PayloadFormat.EncryptedString) {
      key = this.keyToUseForDecryptionOfPayload(payload)
      if (!key) {
        return CreateMaxPayloadFromAnyObject(payload, {
          waitingForKey: true,
          errorDecrypting: true,
        })
      }
    }

    if (key?.errorDecrypting) {
      return CreateMaxPayloadFromAnyObject(payload, {
        waitingForKey: true,
        errorDecrypting: true,
      })
    }

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

  /**
   * Similar to `decryptPayload`, but operates on an array of payloads.
   */
  public async decryptPayloads(payloads: PurePayload[], key?: SNItemsKey): Promise<PurePayload[]> {
    const decryptItem = (encryptedPayload: PurePayload) => {
      if (!encryptedPayload) {
        /** Keep in-counts similar to out-counts */
        return encryptedPayload
      }
      /**
       * We still want to decrypt deleted payloads if they have content in case
       * they were marked as dirty but not yet synced.
       */
      if (encryptedPayload.deleted === true && isNullOrUndefined(encryptedPayload.content)) {
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
   * If an item was attempting to decrypt, but failed, either because the keys
   * for that item had not downloaded yet, or any other reason, it will be deferred
   * item.errorDecrypting = true and possibly item.waitingForKey = true.
   * Here we find such items, and attempt to decrypt them again.
   */
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
    const decrypted = await this.decryptPayloads(payloads)
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

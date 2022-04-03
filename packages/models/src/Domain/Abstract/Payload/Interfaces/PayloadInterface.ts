import { ContentType, ProtocolVersion, Uuid } from '@standardnotes/common'
import { PayloadField } from '../Types/PayloadField'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadSource } from '../Types/PayloadSource'

/**
 * A payload is a vehicle in which item data is transported or persisted.
 * This class represents an abstract PurePayload which does not have any fields. Instead,
 * subclasses must override the `fields` static method to return which fields this particular
 * class of payload contains. For example, a ServerItemPayload is a transmission vehicle for
 * transporting an item to the server, and does not contain fields like PayloadFields.Dirty.
 * However, a StorageItemPayload is a persistence vehicle for saving payloads to disk, and does contain
 * PayloadsFields.Dirty.
 *
 * Payloads are completely immutable and may not be modified after creation. Payloads should
 * not be created directly using the constructor, but instead created using the generators avaiable
 * in generator.js.
 *
 * Payloads also have a content format. Formats can either be
 * EncryptedString or DecryptedBareObject.
 */
export interface PayloadInterface {
  /**
   * When constructed, the payload takes in an array of fields that the input raw payload
   * contains. These fields allow consumers to determine whether a given payload has an actual
   * undefined value for payload.content, for example, or whether the payload was constructed
   * to omit that field altogether (as in the case of server saved payloads)
   * */
  readonly fields: PayloadField[]
  readonly source: PayloadSource
  readonly uuid: Uuid
  readonly content_type: ContentType
  readonly format: PayloadFormat
  version: ProtocolVersion

  /** updated_at is set by the server only, and not the client.*/
  readonly updated_at: Date
  readonly created_at: Date
  readonly created_at_timestamp: number
  readonly updated_at_timestamp: number
  serverUpdatedAt: Date
  serverUpdatedAtTimestamp: number | undefined

  readonly dirtiedDate?: Date
  readonly dirty?: boolean
  readonly lastSyncBegan?: Date
  readonly lastSyncEnd?: Date

  readonly duplicate_of?: Uuid

  ejected(): PayloadInterface
}

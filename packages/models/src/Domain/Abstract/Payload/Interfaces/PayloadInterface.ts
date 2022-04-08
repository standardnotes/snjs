import { ContentType, Uuid } from '@standardnotes/common'
import { ItemContent } from '../../Content/ItemContent'
import { TransferPayload } from '../../TransferPayload/Interfaces/TransferPayload'
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
export interface PayloadInterface<
  T extends TransferPayload = TransferPayload,
  C extends ItemContent = ItemContent,
> {
  readonly source: PayloadSource
  readonly uuid: Uuid
  readonly content_type: ContentType
  content: C | string | undefined
  deleted: boolean

  /** updated_at is set by the server only, and not the client.*/
  readonly updated_at: Date
  readonly created_at: Date
  readonly created_at_timestamp: number
  readonly updated_at_timestamp: number
  get serverUpdatedAt(): Date
  get serverUpdatedAtTimestamp(): number

  readonly dirtiedDate?: Date
  readonly dirty?: boolean
  readonly lastSyncBegan?: Date
  readonly lastSyncEnd?: Date

  readonly duplicate_of?: Uuid

  /**
   * Returns a generic object with all payload fields except any that are meta-data
   * related (such as `fields`, `dirtiedDate`, etc). "Ejected" means a payload for
   * generic, non-contextual consumption, such as saving to a backup file or syncing
   * with a server.
   */
  ejected(): T

  /** Returns only base parameters common to all payloads */
  ejectedBase(): TransferPayload

  /**
   * Returns a new payload by applying the input payload on top of the instance payload.
   */
  mergedWith(payload: this): this

  copy(override?: Partial<T>, source?: PayloadSource): this
}

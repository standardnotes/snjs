import { ContentType, ProtocolVersion } from '@standardnotes/common'
import { deepFreeze, isNullOrUndefined } from '@standardnotes/utils'
import { PayloadField, ValidPayloadKey } from '../Types/PayloadField'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import { Writeable } from '../Utilities/Functions'
import { PayloadFormat } from '../Types/PayloadFormat'
import { TransferPayload } from '../../TransferPayload/Interfaces/TransferPayload'

export abstract class PurePayload implements PayloadInterface {
  readonly fields: ValidPayloadKey[]
  readonly source: PayloadSource
  readonly uuid: string
  readonly content_type: ContentType
  readonly format: PayloadFormat

  readonly created_at: Date
  readonly updated_at: Date
  readonly created_at_timestamp: number = 0
  readonly updated_at_timestamp: number = 0
  readonly dirtiedDate?: Date
  readonly dirty?: boolean

  readonly lastSyncBegan?: Date
  readonly lastSyncEnd?: Date

  version: ProtocolVersion
  readonly duplicate_of?: string

  constructor(rawPayload: TransferPayload, fields: ValidPayloadKey[], source: PayloadSource) {
    this.source = source != undefined ? source : PayloadSource.Constructor
    this.uuid = rawPayload.uuid
    this.fields = fields

    if (!this.uuid && this.fields.includes(PayloadField.Uuid)) {
      throw Error(
        `uuid is null, yet this payloads fields indicate it shouldnt be.
        Content type: ${rawPayload.content_type}`,
      )
    }

    this.content_type = rawPayload.content_type
    this.dirty = rawPayload.dirty
    this.duplicate_of = rawPayload.duplicate_of

    this.created_at = new Date(rawPayload.created_at || new Date())
    this.updated_at = new Date(rawPayload.updated_at || 0)
    this.created_at_timestamp = rawPayload.created_at_timestamp || 0
    this.updated_at_timestamp = rawPayload.updated_at_timestamp || 0
    this.lastSyncBegan = rawPayload.lastSyncBegan ? new Date(rawPayload.lastSyncBegan) : undefined
    this.lastSyncEnd = rawPayload.lastSyncEnd ? new Date(rawPayload.lastSyncEnd) : undefined

    if (rawPayload.dirtiedDate) {
      this.dirtiedDate = new Date(rawPayload.dirtiedDate)
    }

    this.freezeAfterSubclassesFinishConstructing()
  }

  private freezeAfterSubclassesFinishConstructing() {
    setTimeout(() => {
      deepFreeze(this)
    }, 0)
  }

  /**
   * Returns a generic object with all payload fields except any that are meta-data
   * related (such as `fields`, `dirtiedDate`, etc). "Ejected" means a payload for
   * generic, non-contextual consumption, such as saving to a backup file or syncing
   * with a server.
   */
  ejected(): PayloadInterface {
    const optionalFields = [PayloadField.Legacy003AuthHash, PayloadField.Deleted]
    const nonRequiredFields = [
      PayloadField.DirtiedDate,
      PayloadField.ErrorDecrypting,
      PayloadField.ErrorDecryptingChanged,
      PayloadField.WaitingForKey,
      PayloadField.LastSyncBegan,
      PayloadField.LastSyncEnd,
    ]

    const result = {} as Writeable<PayloadInterface>

    for (const field of this.fields) {
      if (nonRequiredFields.includes(field)) {
        continue
      }
      const value = this[field]

      if (isNullOrUndefined(value) && optionalFields.includes(field)) {
        continue
      }

      result[field] = value
    }

    return result
  }

  public get serverUpdatedAt(): Date {
    return this.updated_at
  }

  public get serverUpdatedAtTimestamp(): number {
    return this.updated_at_timestamp
  }
}

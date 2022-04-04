import { ContentType, ProtocolVersion } from '@standardnotes/common'
import { deepFreeze } from '@standardnotes/utils'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import { PayloadFormat } from '../Types/PayloadFormat'
import { TransferPayload } from '../../TransferPayload/Interfaces/TransferPayload'

export abstract class PurePayload implements PayloadInterface {
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

  constructor(rawPayload: TransferPayload, source = PayloadSource.Constructor) {
    this.source = source
    this.uuid = rawPayload.uuid

    if (!this.uuid) {
      throw Error(
        `Attempting to construct payload with null uuid
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

  ejected(): TransferPayload {
    return {
      uuid: this.uuid,
      content_type: this.content_type,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_at_timestamp: this.created_at_timestamp,
      updated_at_timestamp: this.updated_at_timestamp,
      dirty: this.dirty,
      duplicate_of: this.duplicate_of,
    }
  }

  public get serverUpdatedAt(): Date {
    return this.updated_at
  }

  public get serverUpdatedAtTimestamp(): number {
    return this.updated_at_timestamp
  }

  abstract mergedWith(payload: PayloadInterface): PayloadInterface
  abstract copy(override?: Partial<TransferPayload>, source?: PayloadSource): PayloadInterface
}

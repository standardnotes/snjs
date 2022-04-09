import { ContentType } from '@standardnotes/common'
import { deepFreeze, useBoolean } from '@standardnotes/utils'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import { TransferPayload } from '../../TransferPayload/Interfaces/TransferPayload'
import { ItemContent } from '../../Content/ItemContent'

export abstract class PurePayload<T extends TransferPayload<C>, C extends ItemContent = ItemContent>
  implements PayloadInterface<T>
{
  readonly source: PayloadSource
  readonly uuid: string
  readonly content_type: ContentType
  readonly deleted: boolean
  readonly content: C | string | undefined

  readonly created_at: Date
  readonly updated_at: Date
  readonly created_at_timestamp: number = 0
  readonly updated_at_timestamp: number = 0
  readonly dirtiedDate?: Date
  readonly dirty?: boolean

  readonly lastSyncBegan?: Date
  readonly lastSyncEnd?: Date

  readonly duplicate_of?: string

  constructor(rawPayload: T, source = PayloadSource.Constructor) {
    this.source = source
    this.uuid = rawPayload.uuid

    if (!this.uuid) {
      throw Error(
        `Attempting to construct payload with null uuid
        Content type: ${rawPayload.content_type}`,
      )
    }

    this.content = rawPayload.content
    this.content_type = rawPayload.content_type
    this.deleted = useBoolean(rawPayload.deleted, false)
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

    const timeToAllowSubclassesToFinishConstruction = 0
    setTimeout(() => {
      deepFreeze(this)
    }, timeToAllowSubclassesToFinishConstruction)
  }

  ejected(): TransferPayload {
    return {
      uuid: this.uuid,
      content: this.content,
      deleted: this.deleted,
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

  abstract mergedWith(payload: this): this

  abstract copy(override?: Partial<TransferPayload>, source?: PayloadSource): this
}

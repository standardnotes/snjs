/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentType, ProtocolVersion, Uuid } from '@standardnotes/common'
import { ItemContent } from '../Item/ItemContent'
import { ContentReference } from '../Reference/ContentReference'
import { PayloadField } from './PayloadField'
import { PayloadFormat } from './PayloadFormat'
import { PayloadSource } from './PayloadSource'
import { RawPayload } from './RawPayload'

export interface PayloadInterface<C extends ItemContent = ItemContent> {
  readonly fields: PayloadField[]
  readonly source: PayloadSource
  readonly uuid: string
  readonly content_type: ContentType
  readonly content?: C | string
  readonly deleted?: boolean
  readonly items_key_id?: string
  readonly enc_item_key?: string
  readonly created_at?: Date
  /** updated_at is set by the server only, and not the client.
   * For user modification date, see userModifiedAt */
  readonly updated_at: Date
  readonly created_at_timestamp?: number
  readonly updated_at_timestamp?: number
  readonly dirtiedDate?: Date
  readonly dirty?: boolean
  readonly errorDecrypting?: boolean
  readonly waitingForKey?: boolean
  readonly errorDecryptingValueChanged?: boolean
  readonly lastSyncBegan?: Date
  readonly lastSyncEnd?: Date

  /** @deprecated */
  readonly auth_hash?: string
  /** @deprecated */
  readonly auth_params?: any

  readonly format: PayloadFormat
  readonly version: ProtocolVersion
  readonly duplicate_of?: string

  safeContent: C
  references: ContentReference[]
  safeReferences: ContentReference[]
  contentObject: C
  contentString: string
  discardable: boolean | undefined
  serverUpdatedAt: Date
  serverUpdatedAtTimestamp: number | undefined
  getReference(uuid: Uuid): ContentReference
  ejected(): RawPayload<C>
}

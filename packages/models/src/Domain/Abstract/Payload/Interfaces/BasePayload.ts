import { ContentType, Uuid } from '@standardnotes/common'
import { PayloadField } from '../Types/PayloadField'
import { PayloadSource } from '../Types/PayloadSource'

export interface BasePayloadInterface {
  readonly fields: PayloadField[]
  readonly source: PayloadSource
  readonly uuid: Uuid
  readonly content_type: ContentType

  ejected(): BasePayloadInterface
}

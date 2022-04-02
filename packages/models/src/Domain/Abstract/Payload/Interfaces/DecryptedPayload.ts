import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../../Item'
import { ContentReference } from '../../Reference/ContentReference'
import { PayloadInterface } from './PayloadInterface'

export interface DecryptedPayloadInterface<C extends ItemContent = ItemContent>
  extends PayloadInterface {
  readonly content: C
  references: ContentReference[]
  getReference(uuid: Uuid): ContentReference
}

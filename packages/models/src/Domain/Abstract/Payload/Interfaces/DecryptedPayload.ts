import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../../Item'
import { ContentReference } from '../../Item/Reference/ContentReference'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadInterface } from './PayloadInterface'

export interface DecryptedPayloadInterface<C extends ItemContent = ItemContent>
  extends PayloadInterface {
  readonly content: C
  readonly format: PayloadFormat.DecryptedBareObject
  get references(): ContentReference[]
  getReference(uuid: Uuid): ContentReference
  mergedWith(payload: DecryptedPayloadInterface): DecryptedPayloadInterface
}

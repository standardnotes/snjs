import { DecryptedTransferPayload } from './../../TransferPayload/Interfaces/DecryptedTransferPayload'
import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../../Item'
import { ContentReference } from '../../Reference/ContentReference'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadInterface } from './PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'

export interface DecryptedPayloadInterface<C extends ItemContent = ItemContent>
  extends PayloadInterface {
  readonly content: C
  readonly format: PayloadFormat.DecryptedBareObject
  get references(): ContentReference[]
  getReference(uuid: Uuid): ContentReference
  ejected(): DecryptedTransferPayload
  mergedWith(payload: DecryptedPayloadInterface): DecryptedPayloadInterface
  copy(
    override?: Partial<DecryptedTransferPayload>,
    source?: PayloadSource,
  ): DecryptedPayloadInterface<C>
}

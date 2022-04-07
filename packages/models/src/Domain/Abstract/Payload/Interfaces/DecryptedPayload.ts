import { DecryptedTransferPayload } from './../../TransferPayload/Interfaces/DecryptedTransferPayload'
import { ProtocolVersion, Uuid } from '@standardnotes/common'
import { ItemContent } from '../../Item'
import { ContentReference } from '../../Reference/ContentReference'
import { PayloadInterface } from './PayloadInterface'

export interface DecryptedPayloadInterface<C extends ItemContent = ItemContent>
  extends PayloadInterface<DecryptedTransferPayload> {
  readonly version: ProtocolVersion
  readonly content: C

  ejected(): DecryptedTransferPayload<C>
  get references(): ContentReference[]
  getReference(uuid: Uuid): ContentReference
}

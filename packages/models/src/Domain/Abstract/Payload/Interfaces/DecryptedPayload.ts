import { DecryptedTransferPayload } from './../../TransferPayload/Interfaces/DecryptedTransferPayload'
import { ProtocolVersion, Uuid } from '@standardnotes/common'
import { ItemContent } from '../../Item'
import { ContentReference } from '../../Reference/ContentReference'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadInterface } from './PayloadInterface'

export interface DecryptedPayloadInterface<C extends ItemContent = ItemContent>
  extends PayloadInterface<DecryptedTransferPayload> {
  readonly version: ProtocolVersion
  readonly content: C
  readonly format: PayloadFormat.DecryptedBareObject

  get references(): ContentReference[]
  getReference(uuid: Uuid): ContentReference
}

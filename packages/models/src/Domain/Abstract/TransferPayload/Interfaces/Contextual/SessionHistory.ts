import { ItemContent } from '../../../Item/Interfaces/ItemContent'
import { PayloadField, ValidPayloadKey } from '../../../Payload'
import { TransferPayload } from '../TransferPayload'

export const SessionHistoryPayloadFields: Readonly<ValidPayloadKey[]> = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.Content,
  PayloadField.ServerUpdatedAt,
])

export interface SessionHistoryTransferPayload<C extends ItemContent = ItemContent>
  extends TransferPayload {
  content: C
  updated_at: Date
}

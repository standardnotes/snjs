import { ContentlessTransferPayload } from '../../TransferPayload'
import { PayloadInterface } from './PayloadInterface'

export interface ContentlessPayloadInterface extends PayloadInterface<ContentlessTransferPayload> {
  deleted?: boolean
}

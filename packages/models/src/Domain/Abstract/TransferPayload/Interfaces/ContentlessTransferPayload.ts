import { TransferPayload } from './TransferPayload'

export interface ContentlessTransferPayload extends TransferPayload {
  deleted?: boolean
}

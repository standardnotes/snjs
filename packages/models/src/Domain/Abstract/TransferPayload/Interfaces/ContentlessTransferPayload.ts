import { TransferPayload } from './TransferPayload'

export interface ContentlessTransferPayload extends TransferPayload {
  readonly content: undefined
}

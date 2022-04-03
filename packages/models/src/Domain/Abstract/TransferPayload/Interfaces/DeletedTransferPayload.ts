import { TransferPayload } from './TransferPayload'

export interface DeletedTransferPayload extends TransferPayload {
  readonly content: undefined
  readonly deleted: true
}

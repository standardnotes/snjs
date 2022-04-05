import { DeletedTransferPayload } from '../../TransferPayload'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadInterface } from './PayloadInterface'

export interface DeletedPayloadInterface extends PayloadInterface<DeletedTransferPayload> {
  readonly deleted: true
  readonly content: undefined
  readonly format: PayloadFormat.Deleted

  /**
   * Whether a payload can be discarded and removed from storage.
   * This value is true if a payload is marked as deleted and not dirty.
   */
  discardable: boolean | undefined
}

import { DeletedTransferPayload } from './../../TransferPayload/Interfaces/DeletedTransferPayload'
import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { ValidPayloadKey } from '../Types/PayloadField'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class DeletedPayload extends PurePayload implements DeletedPayloadInterface {
  readonly deleted: true
  readonly format: PayloadFormat.Deleted

  constructor(
    rawPayload: DeletedTransferPayload,
    fields: ValidPayloadKey[],
    source: PayloadSource,
  ) {
    super(rawPayload, fields, source)
  }

  /**
   * Whether a payload can be discarded and removed from storage.
   * This value is true if a payload is marked as deleted and not dirty.
   */
  get discardable(): boolean | undefined {
    return !this.dirty
  }
}

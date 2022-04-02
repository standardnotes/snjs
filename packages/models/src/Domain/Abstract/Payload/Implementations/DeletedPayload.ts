import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { PayloadField } from '../Types/PayloadField'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class DeletedPayload extends PurePayload implements DeletedPayloadInterface {
  readonly deleted: true

  constructor(rawPayload: DeletedPayloadInterface, fields: PayloadField[], source: PayloadSource) {
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

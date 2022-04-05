import { DeletedTransferPayload } from './../../TransferPayload/Interfaces/DeletedTransferPayload'
import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class DeletedPayload
  extends PurePayload<DeletedTransferPayload>
  implements DeletedPayloadInterface
{
  readonly deleted: true = true
  readonly content: undefined
  readonly format: PayloadFormat.Deleted = PayloadFormat.Deleted

  constructor(rawPayload: DeletedTransferPayload, source = PayloadSource.Constructor) {
    super(rawPayload, source)
  }

  get discardable(): boolean | undefined {
    return !this.dirty
  }

  ejected(): DeletedTransferPayload {
    const values = {
      deleted: this.deleted,
      content: this.content,
    }

    return {
      ...super.ejected(),
      ...values,
    }
  }

  mergedWith(payload: DeletedPayloadInterface): this {
    const result = new DeletedPayload(
      {
        ...this.ejected(),
        ...payload.ejected(),
      },
      this.source,
    )
    return result as this
  }

  copy(override?: Partial<DeletedTransferPayload>, source = this.source): this {
    const result = new DeletedPayload(
      {
        ...this.ejected(),
        ...override,
      },
      source,
    )
    return result as this
  }
}

import { DeletedTransferPayload } from './../../TransferPayload/Interfaces/DeletedTransferPayload'
import { DeletedPayloadInterface } from '../Interfaces/DeletedPayload'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class DeletedPayload
  extends PurePayload<DeletedTransferPayload>
  implements DeletedPayloadInterface
{
  override readonly deleted: true
  override readonly content: undefined

  constructor(rawPayload: DeletedTransferPayload, source = PayloadSource.Constructor) {
    super(rawPayload, source)
    this.deleted = true
    this.content = undefined
  }

  get discardable(): boolean | undefined {
    return !this.dirty
  }

  override ejected(): DeletedTransferPayload {
    return {
      ...super.ejected(),
      deleted: this.deleted,
      content: undefined,
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

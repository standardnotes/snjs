import { ContentlessTransferPayload } from '../../TransferPayload/Interfaces/ContentlessTransferPayload'
import { ContentlessPayloadInterface } from '../Interfaces/ContentLessPayload'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class ContentlessPayload
  extends PurePayload<ContentlessTransferPayload>
  implements ContentlessPayloadInterface
{
  readonly deleted?: boolean

  constructor(rawPayload: ContentlessTransferPayload, source = PayloadSource.Constructor) {
    super(rawPayload, source)
    this.deleted = rawPayload.deleted
  }

  override ejected(): ContentlessTransferPayload {
    const values = {
      deleted: this.deleted,
    }

    return {
      ...super.ejected(),
      ...values,
    }
  }

  mergedWith(payload: this): this {
    const result = new ContentlessPayload(
      {
        ...this.ejected(),
        ...payload.ejected(),
      },
      this.source,
    )
    return result as this
  }

  copy(override?: Partial<ContentlessTransferPayload>, source = this.source): this {
    const result = new ContentlessPayload(
      {
        ...this.ejected(),
        ...override,
      },
      source,
    )
    return result as this
  }
}

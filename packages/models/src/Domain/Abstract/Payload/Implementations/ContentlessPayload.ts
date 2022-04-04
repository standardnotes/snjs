import { ContentlessTransferPayload } from '../../TransferPayload/Interfaces/ContentlessTransferPayload'
import { ContentlessPayloadInterface } from '../Interfaces/ContentLessPayload'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class ContentlessPayload extends PurePayload implements ContentlessPayloadInterface {
  readonly format: PayloadFormat.Deleted
  readonly content: undefined

  constructor(rawPayload: ContentlessTransferPayload, source = PayloadSource.Constructor) {
    super(rawPayload, source)
  }

  ejected(): ContentlessTransferPayload {
    const values = {
      content: this.content,
    }

    return {
      ...super.ejected(),
      ...values,
    }
  }

  mergedWith(payload: ContentlessPayloadInterface): ContentlessPayloadInterface {
    return new ContentlessPayload(
      {
        ...this.ejected(),
        ...payload.ejected(),
      },
      this.source,
    )
  }
}

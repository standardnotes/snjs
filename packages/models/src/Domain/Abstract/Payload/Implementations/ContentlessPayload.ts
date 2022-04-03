import { ContentlessTransferPayload } from '../../TransferPayload/Interfaces/ContentlessTransferPayload'
import { ContentlessPayloadInterface } from '../Interfaces/ContentLessPayload'
import { ValidPayloadKey } from '../Types/PayloadField'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class ContentlessPayload extends PurePayload implements ContentlessPayloadInterface {
  readonly format: PayloadFormat.Deleted
  readonly content: undefined

  constructor(
    rawPayload: ContentlessTransferPayload,
    fields: ValidPayloadKey[],
    source: PayloadSource,
  ) {
    super(rawPayload, fields, source)
  }
}

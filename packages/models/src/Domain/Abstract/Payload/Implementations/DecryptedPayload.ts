import { ProtocolVersion, Uuid } from '@standardnotes/common'
import { FillItemContent, ItemContent } from '../../Item'
import { ContentReference } from '../../Reference/ContentReference'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { PayloadField } from '../Types/PayloadField'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class DecryptedPayload<C extends ItemContent = ItemContent>
  extends PurePayload
  implements DecryptedPayloadInterface<C>
{
  readonly content: C

  constructor(
    rawPayload: DecryptedPayloadInterface<C>,
    fields: PayloadField[],
    source: PayloadSource,
  ) {
    super(rawPayload, fields, source)

    this.content = FillItemContent<C>(rawPayload.content)
    this.version = this.content.version || ProtocolVersion.V001
  }

  get references(): ContentReference[] {
    return this.content.references || []
  }

  public getReference(uuid: Uuid): ContentReference {
    const result = this.references.find((ref) => ref.uuid === uuid)

    if (!result) {
      throw new Error('Reference not found')
    }

    return result
  }
}

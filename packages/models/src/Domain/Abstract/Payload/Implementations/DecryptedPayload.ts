import { ProtocolVersion, Uuid } from '@standardnotes/common'
import { FillItemContent, ItemContent } from '../../Item'
import { ContentReference } from '../../Item/Reference/ContentReference'
import { DecryptedTransferPayload } from '../../TransferPayload/Interfaces/DecryptedTransferPayload'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class DecryptedPayload<C extends ItemContent = ItemContent>
  extends PurePayload
  implements DecryptedPayloadInterface<C>
{
  readonly content: C
  readonly format = PayloadFormat.DecryptedBareObject

  constructor(rawPayload: DecryptedTransferPayload<C>, source = PayloadSource.Constructor) {
    super(rawPayload, source)

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

  ejected(): DecryptedTransferPayload {
    const values = {
      content: this.content,
    }

    return {
      ...super.ejected(),
      ...values,
    }
  }

  mergedWith(payload: DecryptedPayloadInterface): DecryptedPayloadInterface {
    return new DecryptedPayload(
      {
        ...this.ejected(),
        ...payload.ejected(),
      },
      this.source,
    )
  }
}

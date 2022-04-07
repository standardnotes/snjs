import { ProtocolVersion, Uuid } from '@standardnotes/common'
import { FillItemContent, ItemContent } from '../../Item'
import { ContentReference } from '../../Reference/ContentReference'
import { DecryptedTransferPayload } from '../../TransferPayload/Interfaces/DecryptedTransferPayload'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class DecryptedPayload<
    C extends ItemContent = ItemContent,
    T extends DecryptedTransferPayload<C> = DecryptedTransferPayload<C>,
  >
  extends PurePayload<T>
  implements DecryptedPayloadInterface<C>
{
  readonly content: C
  readonly version: ProtocolVersion

  constructor(rawPayload: T, source = PayloadSource.Constructor) {
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

  override ejected(): T {
    const values = {
      content: this.content,
    }

    return {
      ...super.ejected(),
      ...values,
    }
  }

  mergedWith(payload: this): this {
    const result = new DecryptedPayload(
      {
        ...this.ejected(),
        ...payload.ejected(),
      },
      this.source,
    )
    return result as this
  }

  copy(override?: Partial<T>, source = this.source): this {
    const result = new DecryptedPayload(
      {
        ...this.ejected(),
        ...override,
      },
      source,
    )
    return result as this
  }
}

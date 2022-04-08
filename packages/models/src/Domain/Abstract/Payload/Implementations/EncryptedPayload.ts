import { ProtocolVersion, protocolVersionFromEncryptedString } from '@standardnotes/common'
import { EncryptedTransferPayload } from '../../TransferPayload/Interfaces/EncryptedTransferPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class EncryptedPayload
  extends PurePayload<EncryptedTransferPayload>
  implements EncryptedPayloadInterface
{
  override readonly content: string
  override readonly deleted: false
  readonly auth_hash?: string
  readonly enc_item_key: string
  readonly errorDecrypting: boolean
  readonly items_key_id: string | undefined
  readonly version: ProtocolVersion
  readonly waitingForKey: boolean

  constructor(rawPayload: EncryptedTransferPayload, source = PayloadSource.Constructor) {
    super(rawPayload, source)

    this.auth_hash = rawPayload.auth_hash
    this.content = rawPayload.content
    this.deleted = false
    this.enc_item_key = rawPayload.enc_item_key
    this.errorDecrypting = rawPayload.errorDecrypting
    this.items_key_id = rawPayload.items_key_id
    this.version = protocolVersionFromEncryptedString(this.content)
    this.waitingForKey = rawPayload.waitingForKey
  }

  override ejected(): EncryptedTransferPayload {
    return {
      ...super.ejected(),
      enc_item_key: this.enc_item_key,
      items_key_id: this.items_key_id,
      auth_hash: this.auth_hash,
      errorDecrypting: this.errorDecrypting,
      waitingForKey: this.waitingForKey,
      content: this.content,
    }
  }

  mergedWith(payload: EncryptedPayloadInterface): this {
    const result = new EncryptedPayload(
      {
        ...this.ejected(),
        ...payload.ejected(),
      },
      this.source,
    )
    return result as this
  }

  copy(override?: Partial<EncryptedTransferPayload>, source = this.source): this {
    const result = new EncryptedPayload(
      {
        ...this.ejected(),
        ...override,
      },
      source,
    )
    return result as this
  }
}

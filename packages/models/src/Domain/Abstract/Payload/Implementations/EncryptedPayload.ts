import { protocolVersionFromEncryptedString } from '@standardnotes/common'
import { EncryptedTransferPayload } from '../../TransferPayload/Interfaces/EncryptedTransferPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadSource } from '../Types/PayloadSource'
import { PurePayload } from './PurePayload'

export class EncryptedPayload extends PurePayload implements EncryptedPayloadInterface {
  readonly content: string
  readonly enc_item_key: string
  readonly items_key_id?: string
  readonly errorDecrypting?: boolean
  readonly waitingForKey?: boolean
  readonly errorDecryptingValueChanged?: boolean
  readonly format: PayloadFormat.EncryptedString
  readonly deleted: false

  /** @deprecated */
  readonly auth_hash?: string

  /** @deprecated */
  readonly auth_params?: unknown

  constructor(rawPayload: EncryptedTransferPayload, source = PayloadSource.Constructor) {
    super(rawPayload, source)

    this.content = rawPayload.content
    this.items_key_id = rawPayload.items_key_id
    this.enc_item_key = rawPayload.enc_item_key
    this.errorDecrypting = rawPayload.errorDecrypting
    this.waitingForKey = rawPayload.waitingForKey
    this.errorDecryptingValueChanged = rawPayload.errorDecryptingValueChanged

    this.auth_hash = rawPayload.auth_hash
    this.auth_params = rawPayload.auth_params

    this.version = protocolVersionFromEncryptedString(this.content)
  }

  ejected(): EncryptedTransferPayload {
    const values = {
      content: this.content,
      enc_item_key: this.enc_item_key,
      items_key_id: this.items_key_id,
      auth_hash: this.auth_hash,
    }

    return {
      ...super.ejected(),
      ...values,
    }
  }

  mergedWith(payload: EncryptedPayloadInterface): EncryptedPayloadInterface {
    return new EncryptedPayload(
      {
        ...this.ejected(),
        ...payload.ejected(),
      },
      this.source,
    )
  }

  copy(
    override?: Partial<EncryptedTransferPayload>,
    source = this.source,
  ): EncryptedPayloadInterface {
    return new EncryptedPayload(
      {
        ...this.ejected(),
        ...override,
      },
      source,
    )
  }
}

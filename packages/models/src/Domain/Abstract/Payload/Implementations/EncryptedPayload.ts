import { protocolVersionFromEncryptedString } from '@standardnotes/common'
import { EncryptedTransferPayload } from '../../TransferPayload/Interfaces/EncryptedTransferPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { ValidPayloadKey } from '../Types/PayloadField'
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

  /** @deprecated */
  readonly auth_hash?: string

  /** @deprecated */
  readonly auth_params?: unknown

  constructor(
    rawPayload: EncryptedTransferPayload,
    fields: ValidPayloadKey[],
    source: PayloadSource,
  ) {
    super(rawPayload, fields, source)

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
}

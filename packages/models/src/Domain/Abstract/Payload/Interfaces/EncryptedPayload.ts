import { ProtocolVersion } from '@standardnotes/common'
import { EncryptedTransferPayload } from '../../TransferPayload/Interfaces/EncryptedTransferPayload'
import { PayloadInterface } from './PayloadInterface'

export interface EncryptedPayloadInterface extends PayloadInterface<EncryptedTransferPayload> {
  readonly content: string
  deleted: false
  readonly enc_item_key: string
  readonly items_key_id?: string

  readonly errorDecrypting?: boolean
  readonly waitingForKey?: boolean

  readonly version: ProtocolVersion

  /** @deprecated */
  readonly auth_hash?: string
}

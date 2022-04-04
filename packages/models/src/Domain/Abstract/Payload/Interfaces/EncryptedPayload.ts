import { EncryptedTransferPayload } from '../../TransferPayload/Interfaces/EncryptedTransferPayload'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadSource } from '../Types/PayloadSource'
import { PayloadInterface } from './PayloadInterface'

export interface EncryptedPayloadInterface extends PayloadInterface {
  readonly content: string
  readonly enc_item_key: string
  readonly items_key_id?: string
  readonly format: PayloadFormat.EncryptedString
  readonly deleted: false

  readonly errorDecrypting?: boolean
  readonly waitingForKey?: boolean
  readonly errorDecryptingValueChanged?: boolean

  /** @deprecated */
  readonly auth_hash?: string

  /** @deprecated */
  readonly auth_params?: unknown

  mergedWith(payload: EncryptedPayloadInterface): EncryptedPayloadInterface
  copy(override?: Partial<EncryptedTransferPayload>, source?: PayloadSource): EncryptedPayloadInterface
}

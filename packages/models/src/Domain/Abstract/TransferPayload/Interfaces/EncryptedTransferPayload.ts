import { TransferPayload } from './TransferPayload'

export interface EncryptedTransferPayload extends TransferPayload {
  readonly content: string
  readonly enc_item_key: string
  readonly items_key_id?: string

  readonly errorDecrypting?: boolean
  readonly waitingForKey?: boolean
  readonly errorDecryptingValueChanged?: boolean

  /** @deprecated */
  readonly auth_hash?: string

  /** @deprecated */
  readonly auth_params?: unknown
}

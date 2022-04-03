import { TransferPayload } from './TransferPayload'

export interface EncryptedTransferPayload extends TransferPayload {
  content: string
  enc_item_key: string
  items_key_id?: string

  errorDecrypting?: boolean
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean

  /** @deprecated */
  auth_hash?: string

  /** @deprecated */
  auth_params?: unknown
}

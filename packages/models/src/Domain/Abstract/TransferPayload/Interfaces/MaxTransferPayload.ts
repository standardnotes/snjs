import { ItemContent } from '../../Item'
import { TransferPayload } from './TransferPayload'

export interface MaxTransferPayload extends TransferPayload {
  content: string | ItemContent
  enc_item_key: string
  items_key_id?: string

  errorDecrypting?: boolean
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean

  /** @deprecated */
  auth_hash?: string

  /** @deprecated */
  auth_params?: unknown
  deleted: boolean
}

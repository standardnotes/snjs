import { ItemContent } from '../../Item'
import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadInterface } from './PayloadInterface'

export interface MaxPayloadInterface extends PayloadInterface {
  content: string | ItemContent
  deleted: boolean
  enc_item_key: string
  items_key_id?: string
  format: PayloadFormat.EncryptedString

  errorDecrypting?: boolean
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean

  /** @deprecated */
  auth_hash?: string

  /** @deprecated */
  auth_params?: unknown
}

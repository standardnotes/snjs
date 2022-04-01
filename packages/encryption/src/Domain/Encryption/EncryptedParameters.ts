import { ProtocolVersion } from '@standardnotes/common'
import { ItemContent } from '@standardnotes/models'

export type EncryptedParameters = {
  uuid: string
  content: string
  items_key_id?: string | undefined
  enc_item_key: string
  version: ProtocolVersion

  /** @deprecated */
  auth_hash?: string
}

export type DecryptedParameters<C extends ItemContent = ItemContent> = {
  uuid: string
  content: C
  items_key_id: undefined
  enc_item_key: undefined
  errorDecrypting: false
  waitingForKey: false
  errorDecryptingValueChanged?: boolean

  /** @deprecated */
  auth_hash: undefined

  /** @deprecated */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  auth_params?: any
}

export type ErroredDecryptingParameters = {
  uuid: string
  errorDecrypting: true
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean
}

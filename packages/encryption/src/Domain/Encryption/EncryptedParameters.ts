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
}

export type ErroredDecryptingParameters = {
  uuid: string
  errorDecrypting: true
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean
}

export function isErrorDecryptingParameters(
  x: EncryptedParameters | DecryptedParameters | ErroredDecryptingParameters,
): x is ErroredDecryptingParameters {
  return (x as ErroredDecryptingParameters).errorDecrypting
}

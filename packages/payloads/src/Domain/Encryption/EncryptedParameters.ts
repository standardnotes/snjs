import { CopyPayload } from '../Payload/Functions'
import { PayloadContent } from '../Payload/PayloadContent'
import { PurePayload } from '../Payload/PurePayload'

export type EncryptedParameters = {
  uuid: string
  content: string
  items_key_id?: string | undefined
  enc_item_key: string

  /** @deprecated */
  auth_hash?: string
}

export type DecryptedParameters = {
  uuid: string
  content: PayloadContent
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

export function mergePayloadWithEncryptionParameters(
  payload: PurePayload,
  parameters: EncryptedParameters | DecryptedParameters | ErroredDecryptingParameters,
): PurePayload {
  return CopyPayload(payload, parameters)
}

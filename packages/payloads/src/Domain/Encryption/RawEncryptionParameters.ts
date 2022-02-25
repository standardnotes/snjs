/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadContent } from '../Payload/PayloadContent'

export type RawEncryptionParameters = {
  uuid?: string
  content?: PayloadContent | string
  items_key_id?: string
  enc_item_key?: string
  errorDecrypting?: boolean
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean
  auth_hash?: string
  auth_params?: any
};

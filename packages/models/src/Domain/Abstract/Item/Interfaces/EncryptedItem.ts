import { ProtocolVersion } from '@standardnotes/common'
import { EncryptedPayloadInterface } from '../../Payload/Interfaces/EncryptedPayload'
import { ItemInterface } from './ItemInterface'

export interface EncryptedItemInterface extends ItemInterface {
  readonly payload: EncryptedPayloadInterface
  content: string
  version: ProtocolVersion
  errorDecrypting?: boolean
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean
  auth_hash?: string
  auth_params?: unknown
}

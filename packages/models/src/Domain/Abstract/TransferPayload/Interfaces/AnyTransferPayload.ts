import { DecryptedTransferPayload } from './DecryptedTransferPayload'
import { EncryptedTransferPayload } from './EncryptedTransferPayload'
import { TransferPayload } from './TransferPayload'

export type AnyTransferPayload = TransferPayload &
  EncryptedTransferPayload &
  DecryptedTransferPayload

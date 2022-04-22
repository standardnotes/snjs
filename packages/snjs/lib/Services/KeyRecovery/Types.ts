import { SNRootKey, SNRootKeyParams } from '@standardnotes/encryption'
import { EncryptedTransferPayload, EncryptedPayloadInterface } from '@standardnotes/models'
import { UuidString } from '@Lib/Types'

export type UndecryptableItemsStorage = Record<UuidString, EncryptedTransferPayload>

export type DecryptionCallback = (key: EncryptedPayloadInterface, result: DecryptionResponse) => void

export type DecryptionResponse = {
  success: boolean
  aborted?: boolean
  rootKey?: SNRootKey
}

export type DecryptionQueueItem = {
  key: EncryptedPayloadInterface
  keyParams: SNRootKeyParams
  callback?: DecryptionCallback
  promise?: Promise<DecryptionResponse>
  resolve?: (result: DecryptionResponse) => void
}

export enum KeyRecoveryEvent {
  KeysRecovered = 'KeysRecovered',
}

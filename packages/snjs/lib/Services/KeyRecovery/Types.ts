import { SNRootKey, SNRootKeyParams } from '@standardnotes/encryption'
import { SNItemsKey } from '@standardnotes/models'
import { RawPayload } from '@standardnotes/payloads'
import { UuidString } from '@Lib/Types'

export type UndecryptableItemsStorage = Record<UuidString, RawPayload>

export type DecryptionCallback = (key: SNItemsKey, result: DecryptionResponse) => void

export type DecryptionResponse = {
  success: boolean
  rootKey?: SNRootKey
}

export type DecryptionQueueItem = {
  key: SNItemsKey
  keyParams: SNRootKeyParams
  callback?: DecryptionCallback
  promise?: Promise<DecryptionResponse>
  resolve?: (result: DecryptionResponse) => void
}

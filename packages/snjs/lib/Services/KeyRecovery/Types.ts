import { SNRootKey, SNRootKeyParams } from '@standardnotes/encryption'
import { ItemsKeyInterface } from '@standardnotes/models'
import { RawPayload } from '@standardnotes/models'
import { UuidString } from '@Lib/Types'

export type UndecryptableItemsStorage = Record<UuidString, RawPayload>

export type DecryptionCallback = (key: ItemsKeyInterface, result: DecryptionResponse) => void

export type DecryptionResponse = {
  success: boolean
  rootKey?: SNRootKey
}

export type DecryptionQueueItem = {
  key: ItemsKeyInterface
  keyParams: SNRootKeyParams
  callback?: DecryptionCallback
  promise?: Promise<DecryptionResponse>
  resolve?: (result: DecryptionResponse) => void
}

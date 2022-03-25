import { RawPayload } from '@standardnotes/payloads'
import { UuidString } from '@Lib/types'
import { SNItemsKey } from '@Lib/Models'
import { SNRootKey, SNRootKeyParams } from '@Lib/Protocol'

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

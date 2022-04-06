import * as Payloads from '@standardnotes/models'
import { isDeletedTransferPayload, OfflineSyncSavedContextualPayload } from '@standardnotes/models'
import { deepFreeze } from '@standardnotes/utils'

export class OfflineSyncResponse {
  public readonly savedPayloads: Payloads.OfflineSyncSavedContextualPayload[]
  public readonly deletedPayloads: Payloads.OfflineSyncSavedContextualPayload[]
  constructor(saved: OfflineSyncSavedContextualPayload[]) {
    this.savedPayloads = saved

    this.deletedPayloads = saved.filter((payload) => {
      return isDeletedTransferPayload(payload) && !payload.dirty
    })

    deepFreeze(this)
  }

  public get numberOfItemsInvolved() {
    return this.allProcessedPayloads.length
  }

  public get allProcessedPayloads() {
    const allPayloads = this.savedPayloads
    return allPayloads
  }
}

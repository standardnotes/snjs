import {
  CreateOfflineSyncSavedPayload,
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
} from '@standardnotes/models'
import { ResponseSignalReceiver, SyncSignal } from '@Lib/Services/Sync/Signals'

import { OfflineSyncResponse } from './Response'

export class OfflineSyncOperation {
  /**
   * @param payloads  An array of payloads to sync offline
   * @param receiver  A function that receives callback multiple times during the operation
   */
  constructor(
    private payloads: (DecryptedPayloadInterface | DeletedPayloadInterface)[],
    private receiver: ResponseSignalReceiver<OfflineSyncResponse>,
  ) {
    this.payloads = payloads
    this.receiver = receiver
  }

  async run() {
    const responsePayloads = this.payloads.map((payload) => {
      return CreateOfflineSyncSavedPayload({
        ...payload,
        dirty: false,
        lastSyncEnd: new Date(),
      })
    })

    const response = new OfflineSyncResponse(responsePayloads)

    await this.receiver(SyncSignal.Response, response)
  }
}

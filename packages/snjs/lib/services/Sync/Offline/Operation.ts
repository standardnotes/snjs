import { PurePayload, CreateSourcedPayloadFromObject, PayloadSource } from '@standardnotes/payloads'
import { ResponseSignalReceiver, SyncSignal } from '@Lib/services/Sync/Signals'
import { SyncResponse } from '@Lib/services/Sync/Response'
import { Copy } from '@standardnotes/utils'

export class OfflineSyncOperation {
  payloads: PurePayload[]
  receiver: ResponseSignalReceiver

  /**
   * @param payloads  An array of payloads to sync offline
   * @param receiver  A function that receives callback multiple times during the operation
   */
  constructor(payloads: PurePayload[], receiver: ResponseSignalReceiver) {
    this.payloads = payloads
    this.receiver = receiver
  }

  async run() {
    const responsePayloads = this.payloads.map((payload) => {
      return CreateSourcedPayloadFromObject(payload, PayloadSource.LocalSaved, {
        dirty: false,
        lastSyncEnd: new Date(),
      })
    })
    /* Since we are simulating a server response, they should be pure JS objects */
    const savedItems = Copy(responsePayloads) as any[]
    const response = new SyncResponse({ data: { saved_items: savedItems } })
    await this.receiver(SyncSignal.Response, response)
  }
}

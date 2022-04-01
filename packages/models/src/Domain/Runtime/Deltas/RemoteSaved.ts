import { ImmutablePayloadCollection } from '../Collection/ImmutablePayloadCollection'
import { CreateSourcedPayloadFromObject } from '../../Abstract/Payload/Utilities/Functions'
import { PayloadSource } from '../../Abstract/Payload/PayloadSource'
import { PayloadsDelta } from './Delta'

export class DeltaRemoteSaved extends PayloadsDelta {
  public async resultingCollection() {
    const processed = []
    for (const payload of this.applyCollection.all()) {
      const current = this.findBasePayload(payload.uuid)
      /** If we save an item, but while in transit it is deleted locally, we want to keep
       * local deletion status, and not old deleted value that was sent to server. */
      const deletedState = current ? current.deleted : payload.deleted
      const result = CreateSourcedPayloadFromObject(payload, PayloadSource.RemoteSaved, {
        lastSyncEnd: new Date(),
        deleted: deletedState,
        dirty: deletedState,
      })
      processed.push(result)
    }
    return ImmutablePayloadCollection.WithPayloads(processed, PayloadSource.RemoteSaved)
  }
}

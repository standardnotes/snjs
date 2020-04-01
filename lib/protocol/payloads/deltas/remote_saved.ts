import { PayloadsDelta } from '@Payloads/deltas/delta';
import { PayloadSources } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';
import { CreateSourcedPayloadFromObject } from '@Payloads/generator';

export class DeltaRemoteSaved extends PayloadsDelta {

  public async resultingCollection() {
    const processed = [];
    for (const payload of this.applyCollection.getAllPayloads()) {
      const current = this.findBasePayload(payload.uuid!);
      /** If we save an item, but while in transit it is deleted locally, we want to keep 
       * local deletion status, and not old deleted value that was sent to server.
       */
      const deletedState = current ? current.deleted : payload.deleted;
      const result = CreateSourcedPayloadFromObject(
        payload,
        PayloadSources.RemoteSaved,
        {
          lastSyncEnd: new Date(),
          deleted: deletedState
        }
      );
      processed.push(result);
    }
    return new PayloadCollection(processed, PayloadSources.RemoteSaved);
  }
}

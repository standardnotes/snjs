import { PurePayload } from '@Payloads/pure_payload';
import { SyncResponse } from '@Services/sync/response';

import { DeltaClassForSource } from '@Payloads/deltas/generator';
import { PayloadSource } from '@Payloads/sources';
import { ImmutablePayloadCollection } from '@Payloads/collection';
import { ImmutablePayloadCollectionSet } from '@Payloads/collection_set';
import { CreateSourcedPayloadFromObject, CopyPayload, RawPayload } from '@Payloads/generator';
import { ContentType } from '@Root/lib/models';

/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export class SyncResponseResolver {

  private response: SyncResponse
  private baseCollection: ImmutablePayloadCollection;
  private relatedCollectionSet: ImmutablePayloadCollectionSet

  constructor(
    response: SyncResponse,
    decryptedResponsePayloads: PurePayload[],
    baseCollection: ImmutablePayloadCollection,
    payloadsSavedOrSaving: PurePayload[]
  ) {
    this.response = response;
    this.baseCollection = baseCollection;
    this.relatedCollectionSet = new ImmutablePayloadCollectionSet([
      new ImmutablePayloadCollection(
        decryptedResponsePayloads,
        PayloadSource.DecryptedTransient
      ),
      new ImmutablePayloadCollection(
        payloadsSavedOrSaving,
        PayloadSource.SavedOrSaving
      )
    ]);
  }

  public async collectionsByProcessingResponse() {
    const collections = [];

    const collectionRetrieved = await this.collectionByProcessingPayloads(
      this.response.retrievedPayloads,
      PayloadSource.RemoteRetrieved
    );
    if (collectionRetrieved.all().length > 0) {
      collections.push(collectionRetrieved);
    }

    const collectionSaved = await this.collectionByProcessingPayloads(
      this.response.savedPayloads,
      PayloadSource.RemoteSaved
    );
    if (collectionSaved.all().length > 0) {
      collections.push(collectionSaved);
    }

    if (this.response.uuidConflictPayloads.length > 0) {
      const collectionUuidConflicts = await this.collectionByProcessingPayloads(
        this.response.uuidConflictPayloads,
        PayloadSource.ConflictUuid
      );
      if (collectionUuidConflicts.all().length > 0) {
        collections.push(collectionUuidConflicts);
      }
    }

    if (this.response.dataConflictPayloads.length > 0) {
      const collectionDataConflicts = await this.collectionByProcessingPayloads(
        this.response.dataConflictPayloads,
        PayloadSource.ConflictData
      );
      if (collectionDataConflicts.all().length > 0) {
        collections.push(collectionDataConflicts);
      }
    }

    return collections;
  }

  private async collectionByProcessingPayloads(
    payloads: PurePayload[],
    source: PayloadSource
  ) {
    const collection = new ImmutablePayloadCollection(
      payloads,
      source
    );
    const deltaClass = DeltaClassForSource(source)!;
    // eslint-disable-next-line new-cap
    const delta = new deltaClass(
      this.baseCollection,
      collection,
      this.relatedCollectionSet
    );
    const resultCollection = await delta.resultingCollection();
    const updatedDirtyPayloads = resultCollection.all().map((payload) => {
      const stillDirty = this.finalDirtyStateForPayload(payload);
      return CopyPayload(
        payload,
        {
          dirty: stillDirty,
          dirtiedDate: stillDirty ? new Date() : undefined
        }
      );
    });
    return new ImmutablePayloadCollection(
      updatedDirtyPayloads,
      source
    );
  }

  private finalDirtyStateForPayload(payload: PurePayload) {
    const current = this.baseCollection.find(payload.uuid!);
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    let stillDirty;
    if (current) {
      if (payload.dirtiedDate && payload.dirtiedDate > current.dirtiedDate!) {
        /** The payload was dirtied as part of handling deltas, and not because it was 
         * dirtied by a client. We keep the payload dirty state here. */
        stillDirty = payload.dirty;
      } else {
        /** Marking items dirty after lastSyncBegan will cause them to sync again. */
        stillDirty = current.dirtiedDate! > current.lastSyncBegan!;
      }
    } else {
      /** Forward whatever value any delta resolver may have set */
      stillDirty = payload.dirty;
    }
    return stillDirty;
  }
}

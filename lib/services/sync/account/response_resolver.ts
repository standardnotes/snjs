import { PurePayload } from '@Payloads/pure_payload';
import { SyncResponse } from '@Services/sync/response';

import { DeltaClassForSource } from '@Payloads/deltas/generator';
import { PayloadSources } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';
import { PayloadCollectionSet } from '@Payloads/collection_set';
import { CreateSourcedPayloadFromObject, CopyPayload } from '@Payloads/generator';

/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export class SyncResponseResolver {

  private response: SyncResponse
  private baseCollection: PayloadCollection;
  private relatedCollectionSet: PayloadCollectionSet

  constructor(
    response: SyncResponse,
    decryptedResponsePayloads: PurePayload[],
    baseCollection: PayloadCollection,
    payloadsSavedOrSaving: PurePayload[]
  ) {
    this.response = response;
    this.baseCollection = baseCollection;
    this.relatedCollectionSet = new PayloadCollectionSet([
      new PayloadCollection(
        decryptedResponsePayloads,
        PayloadSources.DecryptedTransient
      ),
      new PayloadCollection(
        payloadsSavedOrSaving,
        PayloadSources.SavedOrSaving
      )
    ]);
  }

  public async collectionsByProcessingResponse() {
    const collections = [];

    const collectionRetrieved = await this.collectionByProcessingRawItems(
      this.response.rawRetrievedItems,
      PayloadSources.RemoteRetrieved
    );
    if (collectionRetrieved.getAllPayloads().length > 0) {
      collections.push(collectionRetrieved);
    }

    const collectionSaved = await this.collectionByProcessingRawItems(
      this.response.rawSavedItems,
      PayloadSources.RemoteSaved
    );
    if (collectionSaved.getAllPayloads().length > 0) {
      collections.push(collectionSaved);
    }

    const collectionUuidConflicts = await this.collectionByProcessingRawItems(
      this.response.rawUuidConflictItems,
      PayloadSources.ConflictUuid
    );

    if (collectionUuidConflicts.getAllPayloads().length > 0) {
      collections.push(collectionUuidConflicts);
    }

    const collectionDataConflicts = await this.collectionByProcessingRawItems(
      this.response.rawDataConflictItems,
      PayloadSources.ConflictData
    );
    if (collectionDataConflicts.getAllPayloads().length > 0) {
      collections.push(collectionDataConflicts);
    }

    return collections;
  }

  private async collectionByProcessingRawItems(rawItems: any[], source: PayloadSources) {
    const payloads = rawItems.map((rawItem) => {
      return CreateSourcedPayloadFromObject(
        rawItem,
        source,
      );
    });
    const collection = new PayloadCollection(
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
    const updatedDirtyPayloads = resultCollection.getAllPayloads().map((payload) => {
      return CopyPayload(
        payload,
        {
          dirty: this.finalDirtyStateForPayload(payload)
        }
      );
    });
    return new PayloadCollection(
      updatedDirtyPayloads,
      source
    );
  }

  private finalDirtyStateForPayload(payload: PurePayload) {
    const current = this.baseCollection.findPayload(payload.uuid!);
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    let stillDirty;
    if (current) {
      /** Marking items dirty after lastSyncBegan will cause them to sync again. */
      stillDirty = current.dirtiedDate! > current.lastSyncBegan!;
    } else {
      /** Forward whatever value any delta resolver may have set */
      stillDirty = payload.dirty;
    }
    return stillDirty;
  }
}

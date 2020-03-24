
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
  constructor({
    response,
    decryptedResponsePayloads,
    baseCollection,
    payloadsSavedOrSaving
  }) {
    this.response = response;
    this.baseCollection = baseCollection;
    this.relatedCollectionSet = new PayloadCollectionSet({
      collections: [
        new PayloadCollection({
          payloads: decryptedResponsePayloads,
          source: PayloadSources.DecryptedTransient
        }),
        new PayloadCollection({
          payloads: payloadsSavedOrSaving,
          source: PayloadSources.SavedOrSaving
        })
      ]
    });
  }

  async collectionsByProcessingResponse() {
    const collections = [];

    const collectionRetrieved = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawRetrievedItems,
      source: PayloadSources.RemoteRetrieved
    });
    if (collectionRetrieved.getAllPayloads().length > 0) {
      collections.push(collectionRetrieved);
    }

    const collectionSaved = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawSavedItems,
      source: PayloadSources.RemoteSaved
    });
    if (collectionSaved.getAllPayloads().length > 0) {
      collections.push(collectionSaved);
    }

    const collectionUuidConflicts = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawUuidConflictItems,
      source: PayloadSources.ConflictUuid
    });

    if (collectionUuidConflicts.getAllPayloads().length > 0) {
      collections.push(collectionUuidConflicts);
    }

    const collectionDataConflicts = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawDataConflictItems,
      source: PayloadSources.ConflictData
    });
    if (collectionDataConflicts.getAllPayloads().length > 0) {
      collections.push(collectionDataConflicts);
    }

    return collections;
  }

  async collectionByProcessingRawItems({ rawItems, source }) {
    const payloads = rawItems.map((rawItem) => {
      return CreateSourcedPayloadFromObject({
        object: rawItem,
        source: source,
      });
    });

    const collection = new PayloadCollection({
      payloads: payloads,
      source: source
    });

    const deltaClass = DeltaClassForSource(source);
    // eslint-disable-next-line new-cap
    const delta = new deltaClass({
      baseCollection: this.baseCollection,
      applyCollection: collection,
      relatedCollectionSet: this.relatedCollectionSet
    });

    const resultCollection = await delta.resultingCollection();
    const updatedDirtyPayloads = resultCollection.allPayloads.map((payload) => {
      return CopyPayload({
        payload: payload,
        override: {
          dirty: this.finalDirtyStateForPayload(payload)
        }
      });
    });

    return new PayloadCollection({
      payloads: updatedDirtyPayloads,
      source: source
    });
  }

  finalDirtyStateForPayload(payload) {
    const current = this.baseCollection.findPayload(payload.uuid);
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    let stillDirty;
    if (current) {
      /** Marking items dirty after lastSyncBegan will cause them to sync again. */
      stillDirty = current.dirtiedDate > current.lastSyncBegan;
    } else {
      /** Forward whatever value any delta resolver may have set */
      stillDirty = payload.dirty;
    }
    return stillDirty;
  }
}

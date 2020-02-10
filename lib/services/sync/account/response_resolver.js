
import { DeltaClassForSource } from '@Payloads/deltas/generator';
import { PayloadSources } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';
import { PayloadCollectionSet } from '@Payloads/collection_set';
import { CreateSourcedPayloadFromObject, CopyPayload } from '@Payloads/generator';

export class AccountSyncResponseResolver {

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
    collections.push(collectionRetrieved);

    const collectionSaved = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawSavedItems,
      source: PayloadSources.RemoteSaved
    });
    collections.push(collectionSaved);

    const collectionUuidConflicts = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawUuidConflictItems,
      source: PayloadSources.ConflictUuid
    });
    collections.push(collectionUuidConflicts);

    const collectionDataConflicts = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawDataConflictItems,
      source: PayloadSources.ConflictData
    });
    collections.push(collectionDataConflicts);

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
          dirty: this.finalDirtyStateForId(payload.uuid)
        }
      });
    });

    return new PayloadCollection({
      payloads: updatedDirtyPayloads,
      source: source
    });
  }

  finalDirtyStateForId(id) {
    const current = this.baseCollection.findPayload(id);
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    let stillDirty;
    if (current) {
      /** Marking items dirty after lastSyncBegan will cause them to sync again. */
      stillDirty = current.dirtiedDate > current.lastSyncBegan;
    } else {
      /** If new item, it must be dirty to be synced */
      stillDirty = true;
    }
    return stillDirty;
  }
}

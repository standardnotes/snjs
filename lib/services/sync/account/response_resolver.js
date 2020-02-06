
import { DeltaClassForSource } from '@Payloads/deltas/generator';
import {
  PayloadSources,
  PayloadCollection,
  PayloadCollectionSet,
  CopyPayload,
  CreateSourcedPayloadFromObject
} from '@Payloads';

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
    if (current) {
      return current.dirtiedDate > current.lastSyncBegan;
    } else {
      /** If new item, it must be dirty to be synced */
      return true;
    }
  }
}

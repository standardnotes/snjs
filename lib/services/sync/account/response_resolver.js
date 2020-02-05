import { extendArray } from '@Lib/utils';
import {
  CreateMaxPayloadFromAnyObject,
  CopyPayload,
  CreateSourcedPayloadFromObject
} from '@Payloads/generator';
import { DeltaClassForSource } from '@Payloads/deltas/generator';
import { DeltaRemoteConflicts } from '@Payloads/deltas';
import * as sources from '@Lib/protocol/payloads/sources';
import { PayloadCollection, PayloadCollectionSet } from '@Payloads';
import {
  ITEM_PAYLOAD_CONTENT,
  ITEM_PAYLOAD_LEGACY_003_AUTH_HASH
} from '@Payloads/fields';

export class AccountSyncResponseResolver  {

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
          source: PayloadSoures.DecryptedTransient
        }),
        new PayloadCollection({
          payloads: payloadsSavedOrSaving,
          source: PayloadSoures.SavedOrSaving
        })
      ]
    })
  }

  async collectionsByProcessingResponse() {
    const collections = [];

    const collectionRetrieved = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawRetrievedItems,
      source: PayloadSoures.RemoteRetrieved
    });
    collections.push(collectionRetrieved);

    const collectionSaved = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawSavedItems,
      source: PayloadSoures.RemoteSaved
    });
    collections.push(collectionSaved);

    const collectionUuidConflicts = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawUuidConflictItems,
      source: PayloadSoures.ConflictUuid
    });
    collections.push(collectionUuidConflicts);

    const collectionDataConflicts = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawDataConflictItems,
      source: PayloadSoures.ConflictData
    });
    collections.push(collectionDataConflicts);

    return collections;
  }

  async collectionByProcessingRawItems({rawItems, source}) {
    const payloads = rawItems.map((rawItem) => {
      return CreateSourcedPayloadFromObject({
        object: rawItem,
        source: source,
      })
    })

    const collection = new PayloadCollection({
      payloads: payloads,
      source: source
    })

    const deltaClass = DeltaClassForSource(source);
    const delta = new deltaClass({
      baseCollection: this.baseCollection,
      applyCollection: collection,
      relatedCollectionSet: this.relatedCollectionSet
    })

    const resultCollection = await delta.resultingCollection();
    const updatedDirtyPayloads = resultCollection.allPayloads.map((payload) => {
      return CopyPayload({
        payload: payload,
        override: {
          dirty: this.finalDirtyStateForId(payload.uuid)
        }
      })
    })

    return new PayloadCollection({
      payloads: updatedDirtyPayloads,
      source: source
    })
  }

  finalDirtyStateForId(id) {
    const current = this.baseCollection.findPayload(id);
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    if(current) {
      return current.dirtiedDate > current.lastSyncBegan;
    } else {
      /** If new item, it must be dirty to be synced */
      return true;
    }
  }
}

import { extendArray } from '@Lib/utils';
import {
  CreateMaxPayloadFromAnyObject,
  CopyPayload,
  CreateSourcedPayloadFromObject
} from '@Protocol/payloads/generator';
import { DeltaClassForSource } from '@Protocol/payloads/deltas/generator';
import { DeltaRemoteConflicts } from '@Protocol/payloads/deltas';
import * as sources from '@Lib/protocol/payloads/sources';
import { PayloadCollection, PayloadCollectionSet } from '@Protocol/payloads';
import {
  ITEM_PAYLOAD_CONTENT,
  ITEM_PAYLOAD_LEGACY_003_AUTH_HASH
} from '@Protocol/payloads/fields';

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
          source: sources.PAYLOAD_SOURCE_DECRYPTED_TRANSIENT
        }),
        new PayloadCollection({
          payloads: payloadsSavedOrSaving,
          source: sources.PAYLOAD_SOURCE_SAVED_OR_SAVING
        })
      ]
    })
  }

  async collectionsByProcessingResponse() {
    const collections = [];

    const collectionRetrieved = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawRetrievedItems,
      source: sources.PAYLOAD_SOURCE_REMOTE_RETRIEVED
    });
    collections.push(collectionRetrieved);

    const collectionSaved = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawSavedItems,
      source: sources.PAYLOAD_SOURCE_REMOTE_SAVED
    });
    collections.push(collectionSaved);

    const collectionUuidConflicts = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawUuidConflictItems,
      source: sources.PAYLOAD_SOURCE_CONFLICT_UUID
    });
    collections.push(collectionUuidConflicts);

    const collectionDataConflicts = await this.collectionByProcessingRawItems({
      rawItems: this.response.rawDataConflictItems,
      source: sources.PAYLOAD_SOURCE_CONFLICT_DATA
    });
    collections.push(collectionDataConflicts);

    if((
      collectionUuidConflicts.allPayloads.length > 0 ||
      collectionDataConflicts.allPayloads.length > 0
    )) {
      this.needsMoreSync = true;
    }

    return collections;
  }

  get conflictsNeedSync() {
    return this.needsMoreSync;
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
      return false;
    }
  }
}

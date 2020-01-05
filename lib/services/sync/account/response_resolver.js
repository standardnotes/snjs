import { extendArray } from '@Lib/utils';
import { CreatePayloadFromAnyObject } from '@Protocol/payloads/generator';
import { DeltaClassForSource } from '@Protocol/payloads/deltas/generator';
import { DeltaRemoteConflicts } from '@Protocol/payloads/deltas';
import * as sources from '@Lib/protocol/payloads/sources';
import { PayloadCollection, PayloadCollectionSet } from '@Protocol/payloads';
import {
  ITEM_PAYLOAD_CONTENT,
  ITEM_PAYLOAD_LEGACY_003_AUTH_HASH
} from '@Protocol/payloads/fields';
const SYNC_CONFLICT_TYPE_CONFLICTING_DATA   = 'sync_conflict';
const SYNC_CONFLICT_TYPE_UUID_CONFLICT      = 'uuid_conflict';

export class AccountSyncResponseResolver  {

  constructor({
    response,
    decryptedResponsePayloads,
    masterCollection,
    payloadsSavedOrSaving
  }) {
    this.response = response;
    this.masterCollection = masterCollection;
    this.relatedCollectionSet = new PayloadCollectionSet({
      collections: [
        new PayloadCollection({
          payloads: this.decryptedResponsePayloads,
          source: sources.PAYLOAD_SOURCE_DECRYPTED_TRANSIENT
        }),
        new PayloadCollection({
          payloads: this.payloadsSavedOrSaving,
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

    const collectionsConflicts = await this.collectionsByProcessingConflicts();
    extendArray(collections, collectionsConflicts);

    for(const conflictCollection of collectionsConflicts) {
      if(conflictCollection.allPayloads.length > 0) {
        this.needsMoreSync = true;
        break;
      }
      this.needsMoreSync = false;
    }
    return collections;
  }

  async collectionByProcessingRawItems({rawItems, source}) {
    const payloads = rawItems.map((rawItem) => {
      return CreatePayloadFromAnyObject({
        object: rawItem,
        source: source,
        override: {
          dirty: this.finalDirtyStateForId(rawItem.uuid)
        }
      })
    })

    const collection = new PayloadCollection({
      payloads: payloads,
      source: source
    })

    const deltaClass = DeltaClassForSource(source);
    const delta = new deltaClass({
      baseCollection: this.masterCollection,
      applyCollection: collection,
      relatedCollectionSet: this.relatedCollectionSet
    })

    return delta.resultingCollection();
  }

  async collectionsByProcessingConflicts() {
    const conflicts = this.response.rawConflictObjects;
    const uuidConflictRawItems = conflicts.filter((conflict) => {
      return conflict.type === SYNC_CONFLICT_TYPE_UUID_CONFLICT;
    }).map((conflict) => {
      return conflict.unsaved_item || conflict.item;
    });
    const dataConflictRawItems = conflicts.filter((conflict) => {
      return conflict.type === SYNC_CONFLICT_TYPE_CONFLICTING_DATA;
    }).map((conflict) => {
      return conflict.server_item || conflict.item;
    });

    const uuidConflictDelta = new DeltaRemoteConflicts({
      baseCollection: this.masterCollection,
      applyCollection: new PayloadCollection({
        payloads: uuidConflictRawItems,
        source: sources.PAYLOAD_SOURCE_CONFLICT_UUID
      }),
      relatedCollectionSet: this.relatedCollectionSet
    })

    const dataConflictDelta = new DeltaRemoteConflicts({
      baseCollection: this.masterCollection,
      applyCollection: new PayloadCollection({
        payloads: dataConflictRawItems,
        source: sources.PAYLOAD_SOURCE_CONFLICT_DATA
      }),
      relatedCollectionSet: this.relatedCollectionSet
    })

    const uuidResults = await uuidConflictDelta.resultingCollection();
    const dataResults = await dataConflictDelta.resultingCollection();
    return [
      uuidResults,
      dataResults
    ];
  }

  finalDirtyStateForId(id) {
    const current = this.masterCollection.findPayload(id);
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    const dirty = current ? current.dirtyCount > 0 : false;
    return dirty;
  }
}

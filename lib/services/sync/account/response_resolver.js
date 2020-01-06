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
const SYNC_CONFLICT_TYPE_CONFLICTING_DATA   = 'sync_conflict';
const SYNC_CONFLICT_TYPE_UUID_CONFLICT      = 'uuid_conflict';

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

  async collectionsByProcessingConflicts() {
    const conflicts = this.response.rawConflictObjects;
    const uuidConflictPayloads = conflicts.filter((conflict) => {
      return conflict.type === SYNC_CONFLICT_TYPE_UUID_CONFLICT;
    }).map((conflict) => {
      const item = conflict.unsaved_item || conflict.item;
      return CreateMaxPayloadFromAnyObject({object: item});
    });
    const dataConflictPayloads = conflicts.filter((conflict) => {
      return conflict.type === SYNC_CONFLICT_TYPE_CONFLICTING_DATA;
    }).map((conflict) => {
      const item = conflict.server_item || conflict.item;
      return CreateMaxPayloadFromAnyObject({object: item});
    });

    const uuidConflictDelta = new DeltaRemoteConflicts({
      baseCollection: this.baseCollection,
      applyCollection: new PayloadCollection({
        payloads: uuidConflictPayloads,
        source: sources.PAYLOAD_SOURCE_CONFLICT_UUID
      }),
      relatedCollectionSet: this.relatedCollectionSet
    })

    const dataConflictDelta = new DeltaRemoteConflicts({
      baseCollection: this.baseCollection,
      applyCollection: new PayloadCollection({
        payloads: dataConflictPayloads,
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
    const current = this.baseCollection.findPayload(id);
    /**
     * `current` can be null in the case of new
     * items that haven't yet been mapped
     */
    const dirty = current ? current.dirtyCount > 0 : false;
    return dirty;
  }
}

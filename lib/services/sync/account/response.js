import { isNullOrUndefined } from '@Lib/utils';
import * as keys from '@Services/api/keys';
import * as sources from '@Payloads/sources';
const SYNC_CONFLICT_TYPE_CONFLICTING_DATA   = 'sync_conflict';
const SYNC_CONFLICT_TYPE_UUID_CONFLICT      = 'uuid_conflict';

export class AccountSyncResponse {
  constructor(rawResponse) {
    this.rawResponse = rawResponse;
  }

  get lastSyncToken() {
    return this.rawResponse[keys.API_KEY_LAST_SYNC_TOKEN];
  }

  get paginationToken() {
    return this.rawResponse[keys.API_KEY_PAGINATION_TOKEN];
  }

  get integrityHash() {
    return this.rawResponse[keys.API_KEY_INTEGRITY_RESULT];
  }

  get checkIntegrity() {
    return this.integrityHash && !this.paginationToken
  }

  get numberOfItemsInvolved() {
    const allRawItems = this.rawSavedItems
      .concat(this.rawRetrievedItems)
      .concat(this.rawItemsFromConflicts);
    return allRawItems.length;
  }

  get allProcessedPayloads() {
    const allPayloads = this.retrievedPayloads
      .concat(this.savedPayloads)
      .concat(this.conflictPayloads);
    return allPayloads;
  }

  get savedPayloads() {
    return this.rawSavedItems.map((rawItem) => {
      return CreateSourcedPayloadFromObject({
        object: rawItem,
        source: PayloadSoures.RemoteSaved
      })
    })
  }

  get retrievedPayloads() {
    return this.rawRetrievedItems.map((rawItem) => {
      return CreateSourcedPayloadFromObject({
        object: rawItem,
        source: PayloadSoures.RemoteRetrieved
      })
    })
  }

  get conflictPayloads() {
    return this.rawItemsFromConflicts.map((rawItem) => {
      return CreateSourcedPayloadFromObject({
        object: rawItem,
        source: PayloadSoures.RemoteRetrieved
      })
    })
  }


  get rawSavedItems() {
    return this.rawResponse.saved_items || [];
  }

  get rawRetrievedItems() {
    return this.rawResponse.retrieved_items || [];
  }

  get rawUuidConflictItems() {
    return this.rawConflictObjects.filter((conflict) => {
      return conflict.type === SYNC_CONFLICT_TYPE_UUID_CONFLICT;
    }).map((conflict) => {
      return conflict.unsaved_item || conflict.item;
    });
  }

  get rawDataConflictItems() {
    return this.rawConflictObjects.filter((conflict) => {
      return conflict.type === SYNC_CONFLICT_TYPE_CONFLICTING_DATA;
    }).map((conflict) => {
      return conflict.server_item || conflict.item;
    });
  }

  get rawItemsFromConflicts() {
    const conflicts = this.rawResponse.conflicts || [];
    const legacyConflicts = this.rawResponse.unsaved || [];
    const rawConflictItems = conflicts.map((conflict) => {
      /** unsaved_item for uuid conflicts,
      and server_item for data conflicts */
      return conflict.unsaved_item || conflict.server_item;
    })
    const rawLegacyConflictItems = legacyConflicts.map((conflict) => {
      return conflict.item;
    })
    return rawConflictItems.concat(rawLegacyConflictItems);
  }

  get rawConflictObjects() {
    const conflicts = this.rawResponse.conflicts || [];
    const legacyConflicts = this.rawResponse.unsaved || [];
    return conflicts.concat(legacyConflicts);
  }

  get hasError() {
    return !isNullOrUndefined(this.rawResponse.error);
  }
}

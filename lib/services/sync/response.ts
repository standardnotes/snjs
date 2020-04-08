import { isNullOrUndefined, deepFreeze } from '@Lib/utils';
import { ApiEndpointParam } from '@Services/api/keys';
import { PayloadSource } from '@Payloads/sources';
import { CreateSourcedPayloadFromObject } from '@Payloads/generator';

const SYNC_CONFLICT_TYPE_CONFLICTING_DATA = 'sync_conflict';
const SYNC_CONFLICT_TYPE_UUID_CONFLICT = 'uuid_conflict';

type RawSyncResponse = {
  error?: any
  [ApiEndpointParam.LastSyncToken]?: string
  [ApiEndpointParam.PaginationToken]?: string
  [ApiEndpointParam.IntegrityResult]?: string
  retrieved_items?: any[]
  saved_items?: any[]
  conflicts?: any[]
  unsaved?: any[]
  status?: number
}

export class SyncResponse {

  public rawResponse: RawSyncResponse

  constructor(rawResponse: RawSyncResponse) {
    this.rawResponse = rawResponse;
    deepFreeze(this);
  }

  get error() {
    return this.rawResponse.error;
  }

  /**
   * Returns the HTTP status code for invalid requests
   */
  get status() : number {
    return this.rawResponse.status!;
  }

  get lastSyncToken() {
    return this.rawResponse[ApiEndpointParam.LastSyncToken];
  }

  get paginationToken() {
    return this.rawResponse[ApiEndpointParam.PaginationToken];
  }

  get integrityHash() {
    return this.rawResponse[ApiEndpointParam.IntegrityResult];
  }

  get checkIntegrity() {
    return this.integrityHash && !this.paginationToken;
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
      return CreateSourcedPayloadFromObject(
        rawItem,
        PayloadSource.RemoteSaved
      );
    });
  }

  /**
   * Items may be deleted from a combination of sources, such as from RemoteSaved,
   * or if a conflict handler decides to delete a payload.
   */
  get deletedPayloads() {
    return this.allProcessedPayloads.filter((payload) => {
      return payload.discardable;
    })
  }

  get retrievedPayloads() {
    return this.rawRetrievedItems.map((rawItem) => {
      return CreateSourcedPayloadFromObject(
        rawItem,
        PayloadSource.RemoteRetrieved
      );
    });
  }

  get conflictPayloads() {
    return this.rawItemsFromConflicts.map((rawItem) => {
      return CreateSourcedPayloadFromObject(
        rawItem,
        PayloadSource.RemoteRetrieved
      );
    });
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
    });
    const rawLegacyConflictItems = legacyConflicts.map((conflict) => {
      return conflict.item;
    });
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

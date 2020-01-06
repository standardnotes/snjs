import { isNullOrUndefined } from '@Lib/utils';
import * as keys from '@Services/api/keys';

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

  get allRawItemsInvolved() {
    return this.rawSavedItems
           .concat(this.rawRetrievedItems)
           .concat(this.rawItemsFromConflicts);
  }

  get numberOfItemsInvolved() {
    return this.allRawItemsInvolved.length;
  }

  get allProcessedPayloads() {
    const allRawItems = this.allRawItemsInvolved;
    return allRawItems.map((rawPayload) => {
      return CreateMaxPayloadFromAnyObject({
        object: rawPayload
      })
    })
  }

  get rawSavedItems() {
    return this.rawResponse.saved_items || [];
  }

  get rawRetrievedItems() {
    return this.rawResponse.retrieved_items || [];
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

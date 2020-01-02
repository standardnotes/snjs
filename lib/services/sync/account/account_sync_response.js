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
           .concat(this.rawConflictedItems);
  }

  get numberOfItemsInvolved() {
    return this.allRawItemsInvolved.length;
  }

  get allProcessedPayloads() {
    const allRawItems = this.allRawItemsInvolved;
    return allRawPayloads.map((rawPayload) => {
      return CreatePayloadFromAnyObject({
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

  get rawConflictedItems() {
    const conflicts = this.rawResponse.conflicted_items || [];
    const legacyConflicts = this.rawResponse.conflicts || [];
    const rawConflictItems = conflicts.map((conflict) => {
      return conflict.conflicted_item;
    })
    const rawLegacyConflictItems = conflicts.map((conflict) => {
      return conflict.item;
    })

    return rawConflictItems.concat(rawLegacyConflictItems);
  }
}

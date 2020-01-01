export class AccountSyncResponse() {
  constructor({rawResponse}) {
    this.rawResponse = rawResponse;
  }

  get lastSyncToken() {
    return this.rawResponse.sync_token;
  }

  get paginationToken() {
    return this.rawResponse.cursor_token;
  }

  get integrityHash() {
    return this.rawResponse.integrity_hash;
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

  get idsOfInterest() {
    return this.allRawItemsInvolved.map((rawItem) => {
      return rawItem.uuid;
    })
  }
}

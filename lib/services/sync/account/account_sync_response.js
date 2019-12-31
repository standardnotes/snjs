export class AccountSyncResponse() {
  constructor({rawResponse}) {
    this.rawResponse = rawResponse;
  }

  get allProcessedPayloads() {
    const rawRetrievedItems = this.rawResponse.retrieved_items || [];
    const rawSavedItems = this.rawResponse.saved_items || [];
    const rawConflictedItems = this.rawConflictedItems;

    const allRawPayloads = rawRetrievedItems
                          .concat(rawSavedItems)
                          .concat(conflictedItems)
                          .concat(rawConflictedItems)

    return allRawPayloads.map((rawPayload) => {
      return CreatePayloadFromAnyObject({
        object: rawPayload
      })
    })
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
    return this.rawConflictedItems.map((rawItem) => {
      return rawItem.uuid;
    })
  }
}

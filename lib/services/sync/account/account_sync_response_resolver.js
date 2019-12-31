import { extendArray } from '@Lib/utils';

export class AccountSyncResponseResolver  {

  constructor({
    request,
    response,
    decryptedPayloads,
    itemsOfInterest
  })  {
    this.request = request;
    this.response = response;
    this.decryptedPayloads = decryptedPayloads;
    this.itemsOfInterest = itemsOfInterest;
  }

  async run() {
    const retrieved_items = this.response.retrieved_items;
    const saved_items = this.response.saved_items;
    const conflicts = this.response.conflicted_items;
    const legacy_conflicts = this.response.conflicts;

    const resultPayloads = [];
    extendArray(resultPayloads, retrieved_items);
    extendArray(resultPayloads, saved_items);

    for(const conflict of conflicts) {
      const resolver = new AccountSyncConflictResolver({
        conflict: conflict,
        itemsOfInterest: this.itemsOfInterest
      });
      const payloads = await resolve.run();
      extendArray(resultPayloads, payloads);
    }

    return resultPayloads;
  }

}

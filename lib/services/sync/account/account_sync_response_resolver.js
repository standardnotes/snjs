import { extendArray } from '@Lib/utils';

export class AccountSyncResponseResolver  {

  constructor({
    request,
    response,
    decryptedResponsePayloads,
    currentItemPayloads
  })  {
    this.request = request;
    this.response = response;
    this.decryptedResponsePayloads = decryptedResponsePayloads;
    this.currentItemPayloads = currentItemPayloads;
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
        decryptedResponsePayloads: this.decryptedResponsePayloads,
        currentItemPayloads: this.currentItemPayloads
      });
      const payloads = await resolve.run();
      extendArray(resultPayloads, payloads);
      this.handledConflicts = payloads;
    }

    return resultPayloads;
  }

  return needsMoreSync() {
    return this.handledConflicts && this.handledConflicts.length > 0;
  }
}

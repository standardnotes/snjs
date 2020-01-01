import { extendArray } from '@Lib/utils';
import { CreatePayloadFromAnyObject } from '@Protocol/payloads/generator';
import {
  ITEM_PAYLOAD_CONTENT,
  ITEM_PAYLOAD_LEGACY_003_AUTH_HASH
} from '@Protocol/payloads/fields';

export class AccountSyncResponseResolver  {

  constructor({
    request,
    response,
    decryptedResponsePayloads,
    currentItemPayloads,
    payloadsSavedOrSaving
  })  {
    this.request = request;
    this.response = response;
    this.decryptedResponsePayloads = decryptedResponsePayloads;
    this.currentItemPayloads = currentItemPayloads;
    this.payloadsSavedOrSaving = payloadsSavedOrSaving;
  }

  async run() {
    const allPayloads = [];

    const processedRetrieved = await this.processRetrievedItems();
    extendArray(allPayloads, processedRetrieved);

    const processedSavedItems = await this.processSavedItems();
    extendArray(allPayloads, processedSavedItems);

    const processedConflicts = await this.processConflictedItems();
    extendArray(allPayloads, processedConflicts);
    this.handledConflicts = processedConflicts;

    const finalProcessed = await this.processAllPayloadDirtyStatus(allPayloads);
    return finalProcessed;
  }

  async processAllPayloadDirtyStatus(allPayloads) {
    const resultPayloads = [];
    for(const payload of allPayloads) {
      const currentItemPayload = this.findCurrentItemPayload(payload.uuid);
      const stillDirty = currentItemPayload.dirtyCount > 0;
      resultPayloads.push(CreatePayloadFromAnyObject({
        object: payload,
        override: {
          dirty: stillDirty
        }
      }))
    }
    return resultPayloads;
  }

  async processRetrievedItems() {
    /**
     * If we have retrieved an item that was saved as part of this ongoing sync operation,
     * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
     */
    const conflictedRetrievedPayloads = [];
    const filteredRetrieved = this.response.retrieved_items.filter((retrievedPayload) => {
      const savedOrSaving = findInArray(this.payloadsSavedOrSaving, 'uuid', retrievedPayload.uuid);
      if(savedOrSaving) {
        conflictedRetrievedPayloads.push(retrievedPayload);
        return false;
      }
      const localItemPayload = this.findCurrentItemPayload(retrievedPayload.uuid);
      if(localItemPayload && localItemPayload.dirty === true) {
        conflictedRetrievedPayloads.push(retrievedPayload);
        return false;
      }
      return true;
    });

    /**
     * For any potential conflict above, we compare the values with current local values, and if they differ,
     * we create a new payload that is a copy of the server payload.
     */
    const conflicts = [];
    for(const potentialConflict of conflictedRetrievedPayloads) {
      const decryptedServerPayload = this.findDecryptedPayload(potentialConflict.uuid);
      const currentPayloadValue = this.findCurrentItemPayload(potentialConflict.uuid);
      if(!currentPayloadValue || !decryptedServerPayload.content) {
        continue;
      }
      if(!currentPayloadValue.compareContentFields(decryptedServerPayload)) {
        const copy = await decryptedServerPayload.copyWithNewId({isConflict: true});
        conflicts.push(copy);
      }
    }

    return filteredRetrieved.concat(conflicts);
  }

  async processSavedItems() {
    /** Merge only metadata for saved items */
    const omitFields = [
      ITEM_PAYLOAD_CONTENT,
      ITEM_PAYLOAD_LEGACY_003_AUTH_HASH
    ];
    const saved_items = this.response.saved_items;
    const processed = saved_items.map((serverPayload) => {
      const decrypted = this.findDecryptedPayload(serverPayload.uuid);
      return CreatePayloadFromAnyObject({
        object: decrypted,
        omit: omitFields
      })
    }
    return processed;
  }

  async processConflictedItems() {
    const conflicts = this.response.conflicted_items;
    const legacy_conflicts = this.response.conflicts;

    const results = [];
    for(const conflict of conflicts) {
      const resolver = new AccountSyncConflictResolver({
        conflict: conflict,
        decryptedResponsePayloads: this.decryptedResponsePayloads,
        currentItemPayloads: this.currentItemPayloads
      });
      const payloads = await resolve.run();
      extendArray(results, payloads);
    }
    return results;
  }

  findDecryptedPayload(id) {
    return this.decryptedResponsePayloads.find((payload) => payload.uuid === id);
  }

  findCurrentItemPayload(id) {
    return this.currentItemPayloads.find((payload) => payload.uuid === id);
  }

  return needsMoreSync() {
    return this.handledConflicts && this.handledConflicts.length > 0;
  }
}

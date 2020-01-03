import { extendArray } from '@Lib/utils';
import { CreatePayloadFromAnyObject } from '@Protocol/payloads/generator';
import {
  ITEM_PAYLOAD_CONTENT,
  ITEM_PAYLOAD_LEGACY_003_AUTH_HASH
} from '@Protocol/payloads/fields';

export class AccountSyncResponseResolver  {

  constructor({
    response,
    decryptedResponsePayloads,
    masterCollection,
    payloadsSavedOrSaving
  })  {
    this.response = response;
    this.decryptedResponsePayloads = decryptedResponsePayloads;
    this.masterCollection = masterCollection;
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
      /** currentItemPayload can be null in the case of new items that haven't yet been mapped */
      const stillDirty = currentItemPayload ? currentItemPayload.dirtyCount > 0 : false;
      const result = CreatePayloadFromAnyObject({
        object: payload,
        override: {
          dirty: stillDirty
        }
      });
      resultPayloads.push(result);
    }
    return resultPayloads;
  }

  async processRetrievedItems() {
    /**
     * If we have retrieved an item that was saved as part of this ongoing sync operation,
     * or if the item is locally dirty, filter it out of retrieved_items, and add to potential conflicts.
     */
    const conflictedRetrievedPayloads = [];
    const filteredRetrieved = this.response.rawRetrievedItems.filter((retrievedPayload) => {
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
     * For any potential conflict above, we compare the values with current
     * local values, and if they differ, we create a new payload that is a copy
     * of the server payload.
     */
    const conflicts = [];
    for(const potentialConflict of conflictedRetrievedPayloads) {
      const decryptedServerPayload = this.findDecryptedPayload(potentialConflict.uuid);
      const currentPayloadValue = this.findCurrentItemPayload(potentialConflict.uuid);
      if(!currentPayloadValue || !decryptedServerPayload.content) {
        continue;
      }
      if(!currentPayloadValue.compareContentFields(decryptedServerPayload)) {
        const copy = await decryptedServerPayload.payloadsByCopying({isConflict: true});
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
    const saved_items = this.response.rawSavedItems;
    const processed = saved_items.map((serverPayload) => {
      const decrypted = this.findDecryptedPayload(serverPayload.uuid);
      if(!decrypted) {
        throw 'Unable to find decrypted counterpart for payload.';
      }
      return CreatePayloadFromAnyObject({
        object: decrypted,
        omit: omitFields
      });
    });
    return processed;
  }

  async processConflictedItems() {
    const conflicts = this.response.rawConflictObjects;
    const results = [];
    for(const conflict of conflicts) {
      const resolver = new AccountSyncConflictResolver({
        conflict: conflict,
        decryptedResponsePayloads: this.decryptedResponsePayloads,
        masterCollection: this.masterCollection
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
    return this.masterCollection.findPayload(id);
  }

  get needsMoreSync() {
    return this.handledConflicts && this.handledConflicts.length > 0;
  }
}

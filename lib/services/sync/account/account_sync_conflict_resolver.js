import { CreateItemFromPayload } from '@Services/modelManager';

const SYNC_CONFLICT_TYPE_CONFLICTING_DATA   = 'sync_conflict';
const SYNC_CONFLICT_TYPE_UUID_CONFLICT      = 'uuid_conflict';
const CONFLICT_STRATEGY_NONE                = 0;
const CONFLICT_STRATEGY_KEEP                = 1;
const CONFLICT_STRATEGY_DUPLICATE           = 2;
/**
  * The number of seconds in between changes to constitue a
  * subjective measure of what we think is active editing of an item
  */
const IS_ACTIVELY_EDITING_THRESHOLD         = 20;

export class AccountSyncConflictResolver {
  constructor({
    conflict,
    decryptedResponsePayloads,
    currentItemPayloads
  }) {
    this.conflict = conflict;
    this.decryptedResponsePayloads = decryptedResponsePayloads;
    this.currentItemPayloads = currentItemPayloads;
  }

  async run() {
    if(this.conflict.type === SYNC_CONFLICT_TYPE_CONFLICTING_DATA) {
      return this.handleConflictingData();
    } else if(this.conflict.type === SYNC_CONFLICT_TYPE_UUID_CONFLICT) {
      return this.handleConflictingUuid();
    } else  {
      throw `Unhandled sync conflict type ${this.conflict.type}`;
    }
  }

  findDecryptedPayload(uuid) {
    return this.decryptedResponsePayloads.find((payload) => {
      return payload.uuid === uuid;
    })
  }

  findCurrentItemPayload(uuid) {
    return this.currentItemPayloads.find((payload) => {
      return payload.uuid === uuid;
    })
  }

  itemIsBeingActivelyEdited(item) {
    return (new Date() - item.client_updated_at) / 1000 < IS_ACTIVELY_EDITING_THRESHOLD;
  }

  /**
   * In sync_conflict, we receive conflict.server_item.
   */
  async handleConflictingData() {
    let rawServerValue = this.conflict.server_item;
    const serverPayload = CreatePayloadFromAnyObject({
      object: rawServerValue
    })
    const decryptedServerPayload = this.findDecryptedPayload(serverPayload.uuid);
    const currentItemPayload = this.findCurrentItemPayload(serverPayload.uuid);

    /*** Could be deleted */
    if(!currentItemPayload) {
      return;
    }

    const results = [];

    /**
     * Current value is always added, since it's value will have changed below,
     * either by mapping, being set to dirty, or being set undirty by the caller
     * but the caller not saving because they're waiting on us.
     */
    results.push(currentItemPayload);

    /** Convert to an object simply so we can have access to the `isItemContentEqualWith` function. */
    const tempServerItem = CreateItemFromPayload(decryptedServerPayload);
    const tempCurrentItem = CreateItemFromPayload(currentItemPayload);
    const contentDiffers = !tempCurrentItem.isItemContentEqualWith(tempServerItem);

    let localStrategy = CONFLICT_STRATEGY_NONE;
    let serverStrategy = CONFLICT_STRATEGY_NONE;

    if(rawServerValue.deleted || currentItemPayload.deleted) {
      serverStrategy = CONFLICT_STRATEGY_KEEP
    } else if(contentDiffers) {
      const isActivelyBeingEdited = this.itemIsBeingActivelyEdited(tempCurrentItem);
      if(isActivelyBeingEdited) {
        localStrategy = CONFLICT_STRATEGY_KEEP;
        serverStrategy = CONFLICT_STRATEGY_DUPLICATE;
      } else {
        localStrategy = CONFLICT_STRATEGY_DUPLICATE;
        serverStrategy = CONFLICT_STRATEGY_KEEP;
      }
    } else if(currentContentDiffers) {
      const contentExcludingReferencesDiffers = !SFItem.AreItemContentsEqual({
        leftContent: tempCurrentItem.content,
        rightContent: tempServerItem.content,
        keysToIgnore: tempCurrentItem.keysToIgnoreWhenCheckingContentEquality().concat(['references']),
        appDataKeysToIgnore: tempCurrentItem.appDataKeysToIgnoreWhenCheckingContentEquality()
      })
      const isOnlyReferenceChange = !contentExcludingReferencesDiffers;
      if(isOnlyReferenceChange) {
        localStrategy = CONFLICT_STRATEGY_KEEP;
      } else {
        localStrategy = CONFLICT_STRATEGY_DUPLICATE;
        serverStrategy = CONFLICT_STRATEGY_KEEP;
      }
    } else {
      /** Items are exactly equal */
      serverStrategy = CONFLICT_STRATEGY_KEEP;
    }

    if(localStrategy === CONFLICT_STRATEGY_DUPLICATE) {
      const payload = CreatePayloadFromAnyObject({
        object: currentItemPayload,
        override: {
          content: {
            conflict_of: currentItemPayload.uuid
          }
        }
      })
      results.push(payload);
    } else if(localStrategy === CONFLICT_STRATEGY_KEEP) {
      const payload = CreatePayloadFromAnyObject({
        object: currentItemPayload,
        override: {
          updated_at: tempServerItem.updated_at,
          dirty: true
        }
      })
      results.push(payload);
    }

    if(serverStrategy === CONFLICT_STRATEGY_DUPLICATE) {
      const payload = CreatePayloadFromAnyObject({
        object: tempServerItem,
        override: {
          content: {
            conflict_of: tempServerItem.uuid
          }
        }
      })
      results.push(payload);
    } else if(serverStrategy === CONFLICT_STRATEGY_KEEP) {
      results.push(decryptedServerPayload);
    }

    return results;
  }

  /**
   * UUID conflicts can occur if a user attempts to import an old data
   * backup with uuids from the old account into a new account.
   * In uuid_conflict, we receive the value we attempted to save.
   */
  async handleConflictingUuid() {
    let rawServerValue = this.conflict.unsaved_item;
    let newItem = await this.modelManager.alternateUUIDForItem(tempCurrentItem);
    itemsNeedingLocalSave.push(newItem);
  }
}

import { PayloadsDelta } from '@Protocol/payloads/deltas/delta';
import { CreateItemFromPayload } from '@Services/modelManager';
import { PayloadCollection } from '@Protocol/payloads';
import * as sources from '@Protocol/payloads/sources';

const CONFLICT_STRATEGY_NONE                = 0;
const CONFLICT_STRATEGY_KEEP                = 1;
const CONFLICT_STRATEGY_DUPLICATE           = 2;
/**
  * The number of seconds in between changes to constitue a
  * subjective measure of what we think is active editing of an item
  */
const IS_ACTIVELY_EDITING_THRESHOLD         = 10;

export class DeltaRemoteConflicts extends PayloadsDelta {

  async resultingCollection() {
    if(this.applyCollection.source === sources.PAYLOAD_SOURCE_CONFLICT_UUID) {
      return this.collectionsByHandlingUuidConflicts();
    } else if(this.applyCollection.source === sources.PAYLOAD_SOURCE_CONFLICT_DATA) {
      return this.collectionsByHandlingDataConflicts();
    } else {
      throw `Unhandled conflict type ${this.applyCollection.source}`;
    }
  }

  async collectionsByHandlingDataConflicts() {
    const results = [];
    for(const payload of this.applyCollection.allPayloads) {
      const current = this.findBasePayload({
        id: payload.uuid
      });

      /*** Could be deleted */
      if(!current) {
        continue;
      }

      /**
       * Current value is always added, since it's value will have changed below,
       * either by mapping, being set to dirty, or being set undirty by the caller
       * but the caller not saving because they're waiting on us.
       */
      results.push(current);

      const decrypted = this.findRelatedPayload({
        id: payload.uuid,
        source: sources.PAYLOAD_SOURCE_DECRYPTED_TRANSIENT
      });

      /** Convert to an object simply so we can have access to the `isItemContentEqualWith` function. */
      const tmpServerItem = CreateItemFromPayload(decrypted);
      const tmpCurrentItem = CreateItemFromPayload(current);
      const contentDiffers = !tmpCurrentItem.isItemContentEqualWith(tmpServerItem);

      let localStrategy = CONFLICT_STRATEGY_NONE;
      let serverStrategy = CONFLICT_STRATEGY_NONE;

      if(raw.deleted || current.deleted) {
        serverStrategy = CONFLICT_STRATEGY_KEEP
      } else if(contentDiffers) {
        const isActivelyBeingEdited = this.itemIsBeingActivelyEdited(tmpCurrentItem);
        if(isActivelyBeingEdited) {
          localStrategy = CONFLICT_STRATEGY_KEEP;
          serverStrategy = CONFLICT_STRATEGY_DUPLICATE;
        } else {
          localStrategy = CONFLICT_STRATEGY_DUPLICATE;
          serverStrategy = CONFLICT_STRATEGY_KEEP;
        }
      } else if(currentContentDiffers) {
        const contentExcludingReferencesDiffers = !SFItem.AreItemContentsEqual({
          leftContent: tmpCurrentItem.content,
          rightContent: tmpServerItem.content,
          keysToIgnore: tmpCurrentItem.contentKeysToIgnoreWhenCheckingEquality().concat(['references']),
          appDataKeysToIgnore: tmpCurrentItem.appDatacontentKeysToIgnoreWhenCheckingEquality()
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
          object: current,
          override: {
            content: {
              conflict_of: current.uuid
            }
          }
        })
        results.push(payload);
      } else if(localStrategy === CONFLICT_STRATEGY_KEEP) {
        const payload = CreatePayloadFromAnyObject({
          object: current,
          override: {
            updated_at: payload.updated_at,
            dirty: true
          }
        })
        results.push(payload);
      }

      if(serverStrategy === CONFLICT_STRATEGY_DUPLICATE) {
        const payload = CreatePayloadFromAnyObject({
          object: decrypted,
          override: {
            content: {
              conflict_of: payload.uuid
            }
          }
        })
        results.push(payload);
      } else if(serverStrategy === CONFLICT_STRATEGY_KEEP) {
        results.push(decrypted);
      }
    }

    return new PayloadCollection({
      payloads: results,
      source: sources.PAYLOAD_SOURCE_REMOTE_RETRIEVED
    })
  }

  /**
   * UUID conflicts can occur if a user attmpts to import an old data
   * backup with uuids from the old account into a new account.
   * In uuid_conflict, we receive the value we attmpted to save.
   */
  async collectionsByHandlingUuidConflicts() {
    const results = [];
    for(const payload of this.applyCollection.allPayloads) {
      const alternateResults = payload.payloadsByAlternatingUuid({
        masterCollection: this.baseCollection
      });
      extendArray(results, alternateResults);
    }

    return new PayloadCollection({
      payloads: results,
      source: sources.PAYLOAD_SOURCE_REMOTE_RETRIEVED
    });
  }

  itemIsBeingActivelyEdited(item) {
    return (new Date() - item.client_updated_at) / 1000 < IS_ACTIVELY_EDITING_THRESHOLD;
  }

}

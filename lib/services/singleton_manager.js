import { PureService } from '@Lib/services/pure_service';
import { SingletonStrategies } from '@Models';
import { arrayByRemovingFromIndex } from '@Lib/utils';
import { CopyPayload } from '@Payloads/generator';
import { Uuid } from '@Lib/uuid';
import { SyncEvents } from '@Services/sync/events';

export class SNSingletonManager extends PureService {

  constructor({ modelManager, syncManager }) {
    super();
    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.addObservers();
    this.resolveQueue = [];
    this.registeredPredicates = [];
  }

  popResolveQueue() {
    const queue = this.resolveQueue.slice();
    this.resolveQueue = [];
    return queue;
  }

  /**
   * We only want to resolve singletons for items that are newly created (because this 
   * is when items proliferate). However, we don't want to resolve immediately on creation,
   * but instead wait for the next full sync to complete. This is so that when you download
   * a singleton and create the object, but the items key for the item has not yet been 
   * downloaded, the singleton will be errorDecrypting, and would be mishandled in the 
   * overall singleton logic. By waiting for a full sync to complete, we can be sure that 
   * all items keys have been downloaded.
   */
  addObservers() {
    this.modelManager.addCreationObserver({
      callback: async ({ items }) => {
        this.resolveQueue = this.resolveQueue.concat(items);
      }
    });
    this.syncManager.addEventObserver((eventName) => {
      if(eventName === SyncEvents.FullSyncCompleted) {
        this.resolveSingletonsForItems(this.popResolveQueue());
      }
    });
  }

  registerPredicate(predicate) {
    this.registeredPredicates.push(predicate);
  }

  validItemsMatchingPredicate(predicate) {
    return this.modelManager
      .itemsMatchingPredicate(predicate).filter((item) => {
        return !item.deleted && !item.errorDecrypting;
      });
  }

  async resolveSingletonsForItems(items) {
    const matchesForRegisteredPredicate = (item) => {
      for (const predicate of this.registeredPredicates) {
        if (item.satisfiesPredicate(predicate)) {
          return this.validItemsMatchingPredicate(predicate);
        }
      }
    };
    const matchesForSelfPredicate = (item) => {
      if (!item.isSingleton) {
        return null;
      }
      return this.validItemsMatchingPredicate(item.singletonPredicate);
    };
    const matches = (item) => {
      const selfMatches = matchesForSelfPredicate(item);
      if(selfMatches) {
        return selfMatches;
      }
      return matchesForRegisteredPredicate(item);
    };
    for (const item of items) {
      const matchingItems = matches(item);
      if (!matchingItems || matchingItems.length <= 1) {
        continue;
      }
      await this.handleStrategy({
        items: matchingItems,
        strategy: item.singletonStrategy
      });
    }
  }

  async handleStrategy({ items, strategy }) {
    if (strategy !== SingletonStrategies.KeepEarliest) {
      throw 'Unhandled singleton strategy';
    }
    const earliestFirst = items.sort((a, b) => {
      /** -1: a comes first, 1: b comes first */
      if (a.errorDecrypting) { return 1; }
      if (b.errorDecrypting) { return -1; }
      return a.created_at < b.created_at ? -1 : 1;
    });
    const deleteItems = arrayByRemovingFromIndex(earliestFirst, 0);
    await this.modelManager.setItemsToBeDeleted(deleteItems);
    await this.syncManager.sync();
  }

  async findOrCreateSingleton({ predicate, createPayload }) {
    const items = this.validItemsMatchingPredicate(predicate);
    if (items.length > 0) {
      return items[0];
    }

    /** Item not found, safe to create after full sync has completed */
    if (!this.syncManager.getLastSyncDate()) {
      await this.syncManager.sync();
    }

    /** Check again */
    const refreshedItems = this.validItemsMatchingPredicate(predicate);
    if (refreshedItems.length > 0) {
      return refreshedItems[0];
    }

    /** Delete any items that are errored */
    const errorDecrypting = this.modelManager
      .itemsMatchingPredicate(predicate).filter((item) => {
        return item.errorDecrypting;
      });
    await this.modelManager.setItemsToBeDeleted(errorDecrypting);

    /** Safe to create */
    const dirtyPayload = CopyPayload({
      payload: createPayload,
      override: {
        uuid: await Uuid.GenerateUuid(),
        dirty: true
      }
    });
    const item = await this.modelManager.mapPayloadToLocalItem({
      payload: dirtyPayload
    });

    await this.syncManager.sync();

    return item;
  }
}

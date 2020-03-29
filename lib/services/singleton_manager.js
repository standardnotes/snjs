import { PureService } from '@Lib/services/pure_service';
import { SingletonStrategies } from '@Models';
import { arrayByRemovingFromIndex, extendArray } from '@Lib/utils';
import { CopyPayload } from '@Payloads/generator';
import { Uuid } from '@Lib/uuid';
import { SyncEvents } from '@Services/sync/events';
import { PayloadSources } from '@Payloads/sources';

/**
 * The singleton manager allow consumers to ensure that only 1 item exists of a certain
 * predicate. For example, consumers may want to ensure that only one item of contentType
 * UserPreferences exist. The singleton manager allows consumers to do this via 2 methods:
 * 1. Consumers may use `findOrCreateSingleton` to retrieve an item if it exists, or create
 *    it otherwise. While this method may serve most cases, it does not allow the consumer 
 *    to subscribe to changes, such as if after this method is called, a UserPreferences object
 *    is downloaded from a remote source.
 * 2. Consumers may use `registerPredicate` in order to constantly monitor a particular
 *    predicate and ensure that only 1 value exists for that predicate. This may be used in
 *    tandem with `findOrCreateSingleton`, for example to monitor a predicate after we 
 *    intitially create the item.
 */
export class SNSingletonManager extends PureService {
  constructor({ modelManager, syncService }) {
    super();
    this.modelManager = modelManager;
    this.syncService = syncService;
    this.addObservers();
    this.resolveQueue = [];
    this.registeredPredicates = [];
  }

  /** @override */
  deinit() {
    this.syncService = null;
    this.modelManager = null;
    this.resolveQueue.length = 0;
    this.registeredPredicates.length = 0;
    this.removeCreationObserver();
    this.removeSyncObserver();
    this.removeCreationObserver = null;
    this.removeSyncObserver = null;
    super.deinit();
  }

  /** @access private */
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
   * @access private
   */
  addObservers() {
    this.removeCreationObserver = this.modelManager.addCreationObserver(
      (items) => {
        this.resolveQueue = this.resolveQueue.concat(items);
      }
    );
    this.removeSyncObserver = this.syncService.addEventObserver(async (eventName) => {
      if (
        eventName === SyncEvents.DownloadFirstSyncCompleted ||
        eventName === SyncEvents.FullSyncCompleted
      ) {
        await this.resolveSingletonsForItems(
          this.popResolveQueue(),
          eventName
        );
      }
    });
  }

  /**
   * Predicates registered are automatically observed. If global item state changes
   * such that the item(s) match the predicate, procedures will be followed such that
   * the end result is that only 1 item remains, and the others are deleted.
   * @access public
   */
  registerPredicate(predicate) {
    this.registeredPredicates.push(predicate);
  }

  /** @access private */
  validItemsMatchingPredicate(predicate) {
    return this.modelManager.itemsMatchingPredicate(predicate)
      .filter((item) => {
        return !item.errorDecrypting;
      });
  }

  /** @access private */
  async resolveSingletonsForItems(items, eventSource) {
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
      if (selfMatches && selfMatches.length > 0) {
        return selfMatches;
      }
      return matchesForRegisteredPredicate(item);
    };
    const handled = [];
    for (const item of items) {
      if (handled.includes(item)) {
        continue;
      }
      const matchingItems = matches(item);
      extendArray(handled, matchingItems || []);
      if (!matchingItems || matchingItems.length <= 1) {
        continue;
      }
      await this.handleStrategy({
        items: matchingItems,
        strategy: item.singletonStrategy
      });
    }

    /** 
     * Only sync if event source is FullSyncCompleted.
     * If it is on DownloadFirstSyncCompleted, we don't need to sync,
     * as a sync request will automatically be made as part of the second phase
     * of a download-first request.
     */
    if (handled.length > 0 && eventSource === SyncEvents.FullSyncCompleted) {
      /** 
       * Do not await. We want any local-side changes to 
       * be awaited but the actual sync shouldn't be since it's non-essential
       * Perform after timeout so that we can yield to event notifier that triggered us 
       */
      setTimeout(() => {
        this.syncService.sync();
      });
    }
  }

  /** @access private */
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
  }

  /** @access public */
  async findOrCreateSingleton({ predicate, createPayload }) {
    const items = this.validItemsMatchingPredicate(predicate);
    if (items.length > 0) {
      return items[0];
    }
    /** Item not found, safe to create after full sync has completed */
    if (!this.syncService.getLastSyncDate()) {
      await this.syncService.sync();
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
    const dirtyPayload = CopyPayload(
      createPayload,
      {
        uuid: await Uuid.GenerateUuid(),
        dirty: true
      }
    );
    const item = await this.modelManager.mapPayloadToLocalItem(
      dirtyPayload,
      PayloadSources.LocalChanged
    );
    await this.syncService.sync();
    return item;
  }
}

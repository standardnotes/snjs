import { ItemManager } from '@Services/item_manager';
import { PurePayload } from '@Payloads/pure_payload';
import { SNPredicate } from '@Models/core/predicate';
import { SNItem } from '@Models/core/item';
import { PureService } from '@Lib/services/pure_service';
import { SingletonStrategies, ContentType } from '@Models/index';
import { arrayByRemovingFromIndex, extendArray } from '@Lib/utils';
import { CopyPayload, PayloadOverride, PayloadContent, CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { Uuid } from '@Lib/uuid';
import { SyncEvent } from '@Services/sync/events';
import { SNSyncService } from './sync/sync_service';
import { Uuids } from '../models/generator';

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

  private itemManager?: ItemManager
  private syncService?: SNSyncService
  private resolveQueue: SNItem[] = []
  private registeredPredicates: SNPredicate[] = []

  private removeItemObserver: any
  private removeSyncObserver: any

  constructor(itemManager: ItemManager, syncService: SNSyncService) {
    super();
    this.itemManager = itemManager;
    this.syncService = syncService;
    this.addObservers();
  }

  public deinit() {
    this.syncService = undefined;
    this.itemManager = undefined;
    this.resolveQueue.length = 0;
    this.registeredPredicates.length = 0;
    this.removeItemObserver();
    this.removeItemObserver = undefined;
    this.removeSyncObserver();
    this.removeSyncObserver = undefined;
    super.deinit();
  }

  private popResolveQueue() {
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
  private addObservers() {
    this.removeItemObserver = this.itemManager!.addObserver(
      ContentType.Any,
      async (_, inserted) => {
        if (inserted.length > 0) {
          this.resolveQueue = this.resolveQueue.concat(inserted);
        }
      }
    );
    this.removeSyncObserver = this.syncService!.addEventObserver(async (eventName) => {
      if (
        eventName === SyncEvent.DownloadFirstSyncCompleted ||
        eventName === SyncEvent.FullSyncCompleted
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
   */
  public registerPredicate(predicate: SNPredicate) {
    this.registeredPredicates.push(predicate);
  }

  private validItemsMatchingPredicate(predicate: SNPredicate) {
    return this.itemManager!.itemsMatchingPredicate(predicate)
      .filter((item) => {
        return !item.errorDecrypting;
      });
  }

  private async resolveSingletonsForItems(items: SNItem[], eventSource: SyncEvent) {
    const matchesForRegisteredPredicate = (item: SNItem) => {
      for (const predicate of this.registeredPredicates) {
        if (item.satisfiesPredicate(predicate)) {
          return this.validItemsMatchingPredicate(predicate);
        }
      }
    };
    const matchesForSelfPredicate = (item: SNItem) => {
      if (!item.isSingleton) {
        return null;
      }
      return this.validItemsMatchingPredicate(item.singletonPredicate);
    };
    const matches = (item: SNItem) => {
      const selfMatches = matchesForSelfPredicate(item);
      if (selfMatches && selfMatches.length > 0) {
        return selfMatches;
      }
      return matchesForRegisteredPredicate(item);
    };
    const handled: SNItem[] = [];
    for (const item of items) {
      if (handled.includes(item)) {
        continue;
      }
      const matchingItems = matches(item);
      extendArray(handled, matchingItems || []);
      if (!matchingItems || matchingItems.length <= 1) {
        continue;
      }
      await this.handleStrategy(
        matchingItems,
        item.singletonStrategy
      );
    }

    /** 
     * Only sync if event source is FullSyncCompleted.
     * If it is on DownloadFirstSyncCompleted, we don't need to sync,
     * as a sync request will automatically be made as part of the second phase
     * of a download-first request.
     */
    if (handled.length > 0 && eventSource === SyncEvent.FullSyncCompleted) {
      /** 
       * Do not await. We want any local-side changes to 
       * be awaited but the actual sync shouldn't be since it's non-essential
       * Perform after timeout so that we can yield to event notifier that triggered us 
       */
      setTimeout(() => {
        this.syncService!.sync();
      });
    }
  }

  private async handleStrategy(items: SNItem[], strategy: SingletonStrategies) {
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
    await this.itemManager!.setItemsToBeDeleted(Uuids(deleteItems));
  }

  public async findOrCreateSingleton(
    predicate: SNPredicate,
    createContentType: ContentType,
    createContent: PayloadContent
  ) {
    const items = this.validItemsMatchingPredicate(predicate);
    if (items.length > 0) {
      return items[0];
    }
    /** Item not found, safe to create after full sync has completed */
    if (!this.syncService!.getLastSyncDate()) {
      await this.syncService!.sync();
    }
    /** Check again */
    const refreshedItems = this.validItemsMatchingPredicate(predicate);
    if (refreshedItems.length > 0) {
      return refreshedItems[0];
    }
    /** Delete any items that are errored */
    const errorDecrypting = this.itemManager!
      .itemsMatchingPredicate(predicate).filter((item) => {
        return item.errorDecrypting;
      });
    await this.itemManager!.setItemsToBeDeleted(Uuids(errorDecrypting));
    /** Safe to create */
    const dirtyPayload = CreateMaxPayloadFromAnyObject(
      {
        uuid: await Uuid.GenerateUuid(),
        content_type: createContentType,
        content: createContent,
        dirty: true,
        dirtiedDate: new Date()
      }
    );
    const item = await this.itemManager!.emitItemFromPayload(dirtyPayload);
    await this.syncService!.sync();
    return item;
  }
}

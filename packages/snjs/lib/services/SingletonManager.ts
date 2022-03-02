import { ContentType } from '@standardnotes/common'
import { ItemManager } from '@Lib/services/Items/ItemManager'
import { SNItem, SingletonStrategy } from '@Models/core/item'
import {
  arrayByRemovingFromIndex,
  extendArray,
  isNullOrUndefined,
  UuidGenerator,
} from '@standardnotes/utils'
import {
  CreateMaxPayloadFromAnyObject,
  PayloadContent,
  PredicateInterface,
} from '@standardnotes/payloads'
import { SNSyncService } from './Sync/SyncService'
import { Uuids } from '@Models/functions'
import { AbstractService, InternalEventBusInterface, SyncEvent } from '@standardnotes/services'

/**
 * The singleton manager allow consumers to ensure that only 1 item exists of a certain
 * predicate. For example, consumers may want to ensure that only one item of contentType
 * UserPreferences exist. The singleton manager allows consumers to do this via 2 methods:
 * 1. Consumers may use `findOrCreateSingleton` to retrieve an item if it exists, or create
 *    it otherwise. While this method may serve most cases, it does not allow the consumer
 *    to subscribe to changes, such as if after this method is called, a UserPreferences object
 *    is downloaded from a remote source.
 * 2. Items can override isSingleton, singletonPredicate, and strategyWhenConflictingWithItem (optional)
 *    to automatically gain singleton resolution.
 */
export class SNSingletonManager extends AbstractService {
  private resolveQueue: SNItem[] = []

  private removeItemObserver!: () => void
  private removeSyncObserver!: () => void

  constructor(
    private itemManager: ItemManager,
    private syncService: SNSyncService,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
    this.itemManager = itemManager
    this.syncService = syncService
    this.addObservers()
  }

  public deinit(): void {
    ;(this.syncService as unknown) = undefined
    ;(this.itemManager as unknown) = undefined
    this.resolveQueue.length = 0
    this.removeItemObserver()
    ;(this.removeItemObserver as unknown) = undefined
    this.removeSyncObserver()
    ;(this.removeSyncObserver as unknown) = undefined
    super.deinit()
  }

  private popResolveQueue() {
    const queue = this.resolveQueue.slice()
    this.resolveQueue = []
    return queue
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
    this.removeItemObserver = this.itemManager.addObserver(ContentType.Any, (changed, inserted) => {
      if (changed.length > 0) {
        /**
         * For performance reasons, we typically only queue items in the resolveQueue once,
         * when they are inserted. However, items recently inserted could still be errorDecrypting.
         * We want to re-run singleton logic on any items whose decryption status has changed,
         * due to the fact that singleton logic does not apply properly if an item is not
         * decrypted.
         */
        const decryptionStatusChanged = changed.filter((i) => i.errorDecryptingValueChanged)
        if (decryptionStatusChanged.length > 0) {
          this.resolveQueue = this.resolveQueue.concat(decryptionStatusChanged)
        }
      }
      if (inserted.length > 0) {
        this.resolveQueue = this.resolveQueue.concat(inserted)
      }
    })
    this.removeSyncObserver = this.syncService.addEventObserver(async (eventName) => {
      if (
        eventName === SyncEvent.DownloadFirstSyncCompleted ||
        eventName === SyncEvent.FullSyncCompleted
      ) {
        await this.resolveSingletonsForItems(this.popResolveQueue(), eventName)
      }
    })
  }

  private validItemsMatchingPredicate<T extends SNItem>(
    contentType: ContentType,
    predicate: PredicateInterface<T>,
  ) {
    return this.itemManager.itemsMatchingPredicate(contentType, predicate).filter((item) => {
      return !item.errorDecrypting
    })
  }

  private async resolveSingletonsForItems(items: SNItem[], eventSource: SyncEvent) {
    const handled: SNItem[] = []
    for (const item of items) {
      if (handled.includes(item) || !item.isSingleton) {
        continue
      }
      const matchingItems = this.validItemsMatchingPredicate<SNItem>(
        item.content_type,
        item.singletonPredicate(),
      )
      extendArray(handled, matchingItems || [])
      if (!matchingItems || matchingItems.length <= 1) {
        continue
      }
      await this.handleStrategy(matchingItems, item.singletonStrategy)
    }
    /**
     * Only sync if event source is FullSyncCompleted.
     * If it is on DownloadFirstSyncCompleted, we don't need to sync,
     * as a sync request will automatically be made as part of the second phase
     * of a download-first request.
     */
    if (handled.length > 0 && eventSource === SyncEvent.FullSyncCompleted) {
      await this.syncService?.sync()
    }
  }

  private async handleStrategy(items: SNItem[], strategy: SingletonStrategy) {
    if (strategy !== SingletonStrategy.KeepEarliest) {
      throw 'Unhandled singleton strategy'
    }
    const earliestFirst = items.sort((a, b) => {
      /** -1: a comes first, 1: b comes first */
      if (a.errorDecrypting) {
        return 1
      }
      if (b.errorDecrypting) {
        return -1
      }
      return a.created_at < b.created_at ? -1 : 1
    })
    const deleteItems = arrayByRemovingFromIndex(earliestFirst, 0)
    await this.itemManager.setItemsToBeDeleted(Uuids(deleteItems))
  }

  public findSingleton<T extends SNItem>(
    contentType: ContentType,
    predicate: PredicateInterface<T>,
  ): T | undefined {
    const matchingItems = this.validItemsMatchingPredicate(contentType, predicate)
    if (matchingItems.length > 0) {
      return matchingItems[0] as T
    }
    return undefined
  }

  public async findOrCreateSingleton<T extends SNItem = SNItem>(
    predicate: PredicateInterface<T>,
    createContentType: ContentType,
    createContent: PayloadContent,
  ): Promise<T> {
    const existingSingleton = this.findSingleton<T>(createContentType, predicate)
    if (!isNullOrUndefined(existingSingleton)) {
      return existingSingleton
    }
    /** Item not found, safe to create after full sync has completed */
    if (!this.syncService.getLastSyncDate()) {
      /** Add a temporary observer in case of long-running sync request, where
       * the item we're looking for ends up resolving early or in the middle. */
      let matchingItem: SNItem | undefined
      const removeObserver = this.itemManager.addObserver(createContentType, (_, inserted) => {
        if (inserted.length > 0) {
          const matchingItems = this.itemManager.subItemsMatchingPredicates<T>(inserted as T[], [
            predicate,
          ])
          if (matchingItems.length > 0) {
            matchingItem = matchingItems[0]
          }
        }
      })
      await this.syncService.sync()
      removeObserver()
      if (matchingItem) {
        return matchingItem as T
      }
      /** Check again */
      const refreshedItems = this.validItemsMatchingPredicate(createContentType, predicate)
      if (refreshedItems.length > 0) {
        return refreshedItems[0] as T
      }
    }
    /** Delete any items that are errored */
    const errorDecrypting = this.itemManager
      .itemsMatchingPredicate(createContentType, predicate)
      .filter((item) => {
        return item.errorDecrypting
      })
    if (errorDecrypting.length) {
      await this.itemManager.setItemsToBeDeleted(Uuids(errorDecrypting))
    }

    /** Safe to create */
    const dirtyPayload = CreateMaxPayloadFromAnyObject({
      uuid: await UuidGenerator.GenerateUuid(),
      content_type: createContentType,
      content: createContent,
      dirty: true,
      dirtiedDate: new Date(),
    })
    const item = await this.itemManager.emitItemFromPayload(dirtyPayload)
    this.syncService.sync()
    return item as T
  }
}

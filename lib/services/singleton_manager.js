import { SFItem } from '@Models/core/item';
import { arrayByRemovingFromIndex } from '@Lib/utils';
import { SINGLETON_STRATEGY_KEEP_EARLIEST } from '@Models/core/item';
import { PAYLOAD_SOURCE_LOCAL_DIRTIED } from '@Payloads/sources';
import { CopyPayload } from '@Payloads/generator';

export class SNSingletonManager {

  constructor({modelManager, syncManager}) {
    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.addMappingObserver();
  }

  addMappingObserver() {
    this.modelManager.addMappingObserverWithPriority({
      id: 'singleton-manager',
      types: '*',
      priority: -1,
      callback: async (allItems, validItems, deletedItems, source, sourceKey) => {
        /**
         * Inside resolveSingletons, we are going to set items as dirty.
         * If we don't stop here it result in infinite recursion.
         */
        if(source === PAYLOAD_SOURCE_LOCAL_DIRTIED) {
          return;
        }
        await this.resolveSingletonsForItems(validItems);
      }
    })

    /** @todo needs replacement */
    // If an item alternates its uuid on account registration, singletonHandlers might need to update
    // their local reference to the object, since the object reference will change on uuid alternation
    // modelManager.addModelUuidChangeObserver("singleton-manager", (oldModel, newModel) => {
    //   for(const handler of this.singletonHandlers) {
    //     if(handler.singleton && SFPredicate.ItemSatisfiesPredicates(newModel, handler.predicates)) {
    //       // Reference is now invalid, calling resolveSingleton should update it
    //       handler.singleton = null;
    //       this.resolveSingletons([newModel]);
    //     }
    //   }
    // })
  }

  validItemsMatchingPredicate(predicate) {
    return this.modelManager
          .itemsMatchingPredicate(predicate).filter((item) => {
            return !item.deleted && !item.errorDecrypting;
          })
  }

  async resolveSingletonsForItems(items) {
    for(const item of items) {
      if(!item.isSingleton) {
        continue;
      }

      const predicate = item.singletonPredicate;
      const items = this.validItemsMatchingPredicate(predicate);
      if(items.length <= 1) {
        continue;
      }

      await this.handleStrategy({
        items: items,
        strategy: item.singletonStrategy
      });
    }
  }

  async handleStrategy({items, strategy}) {
    if(strategy !== SINGLETON_STRATEGY_KEEP_EARLIEST) {
      throw 'Unhandled singleton strategy';
    }

    const earliestFirst = items.sort((a, b) => {
      /** -1: a comes first, 1: b comes first */
      if(a.errorDecrypting) { return 1 }
      if(b.errorDecrypting) { return -1 }
      return a.created_at < b.created_at ? -1 : 1;
    });

    const keep = earliestFirst[0];
    const deleteItems = arrayByRemovingFromIndex(earliestFirst, 0);
    await this.modelManager.setItemsToBeDeleted(deleteItems);
    await this.syncManager.sync();
  }

  async findOrCreateSingleton({predicate, createPayload}) {
    const items = this.validItemsMatchingPredicate(predicate);
    if(items.length > 0) {
      return items[0];
    }

    /** Item not found, safe to create after full sync has completed */
    if(!this.syncManager.getLastSyncDate()) {
      await this.syncManager.sync();
    }

    /** Check again */
    const refreshedItems = this.validItemsMatchingPredicate(predicate);
    if(refreshedItems.length > 0) {
      return refreshedItems[0];
    }

    /** Delete any items that are errored */
    const errorDecrypting = this.modelManager
    .itemsMatchingPredicate(predicate).filter((item) => {
      return item.errorDecrypting;
    })
    await this.modelManager.setItemsToBeDeleted(errorDecrypting);

    /** Safe to create */
    const dirtyPayload = CopyPayload({
      payload: createPayload,
      override: {
        uuid: await SFItem.GenerateUuid(),
        dirty: true
      }
    });
    const item = await this.modelManager.mapPayloadToLocalItems({
      payload: dirtyPayload
    });

    await this.syncManager.sync();

    return item;
  }
}

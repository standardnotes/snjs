/**
 * The SingletonManager allows controllers to register an item as a singleton, which means only one instance of that model
 * should exist, both on the server and on the client. When the SingletonManager detects multiple items matching the singleton predicate,
 * the earliest created_at wins, and the rest are deleted.
 */

import { SFModelManager } from '@Services/modelManager'
import { SFPredicate } from '@Models/core/predicate'

export class SNSingletonManager {

  constructor({modelManager, syncManager}) {
    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.singletonHandlers = [];

    // We use sync observer instead of syncEvent `local-data-incremental-load`, because we want singletons
    // to resolve with the first priority, because they generally dictate app state.
    modelManager.addItemSyncObserverWithPriority({
      id: "sf-singleton-manager",
      types: "*",
      priority: -1,
      callback: (allItems, validItems, deletedItems, source, sourceKey) => {
        // Inside resolveSingletons, we are going to set items as dirty. If we don't stop here it result in infinite recursion.
        if(source === SFModelManager.MappingSourceLocalDirtied) {
          return;
        }
        this.resolveSingletons(modelManager.allNondummyItems, true);
      }
    })

    syncManager.addEventHandler((syncEvent, data) => {
      if(syncEvent == "local-data-loaded") {
        this.resolveSingletons(modelManager.allNondummyItems, true);
        this.initialDataLoaded = true;
      } else if(syncEvent == "sync:completed") {
        // Wait for initial data load before handling any sync. If we don't want for initial data load,
        // then the singleton resolver won't have the proper items to work with to determine whether to resolve or create.
        if(!this.initialDataLoaded) {
          return;
        }

        this.resolveSingletons(data.retrievedItems);
      }
    });


    // If an item alternates its uuid on account registration, singletonHandlers might need to update
    // their local reference to the object, since the object reference will change on uuid alternation
    modelManager.addModelUuidChangeObserver("singleton-manager", (oldModel, newModel) => {
      for(const handler of this.singletonHandlers) {
        if(handler.singleton && SFPredicate.ItemSatisfiesPredicates(newModel, handler.predicates)) {
          // Reference is now invalid, calling resolveSingleton should update it
          handler.singleton = null;
          this.resolveSingletons([newModel]);
        }
      }
    })
  }

  /**
   * @param predicate  A key/value pair that specifies properties that should match in order for an item to be considered a predicate
   * @param resolveCallback  Called when one or more items are deleted and a new item becomes the reigning singleton
   * @param createBlock  Called when a sync is complete and no items are found. The createBlock should create the item and return it.
   */
  registerSingleton(predicates, resolveCallback, createBlock) {
    this.singletonHandlers.push({
      predicates: predicates,
      resolutionCallback: resolveCallback,
      createBlock: createBlock
    });
  }

  resolveSingletons(retrievedItems, initialLoad) {
    retrievedItems = retrievedItems || [];

    for(const singletonHandler of this.singletonHandlers) {
      const predicates = singletonHandler.predicates.slice();
      const retrievedSingletonItems = this.modelManager.filterItemsWithPredicates(retrievedItems, predicates);

      const handleCreation = () => {
        if(singletonHandler.createBlock) {
          singletonHandler.pendingCreateBlockCallback = true;
          singletonHandler.createBlock((created) => {
            singletonHandler.singleton = created;
            singletonHandler.pendingCreateBlockCallback = false;
            singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(created);
          });
        }
      }

      if(retrievedSingletonItems.length > 0) {
        // Check local inventory and make sure only 1 similar item exists. If more than 1, keep oldest, delete rest.
        const allExtantItemsMatchingPredicate = this.modelManager.itemsMatchingPredicates(predicates);
        // Delete all but the earliest created
        if(allExtantItemsMatchingPredicate.length >= 2) {
          const sorted = allExtantItemsMatchingPredicate.sort((a, b) => {
            // If compareFunction(a, b) is less than 0, sort a to an index lower than b, i.e. a comes first.
            // If compareFunction(a, b) is greater than 0, sort b to an index lower than a, i.e. b comes first.
            if(a.errorDecrypting) { return 1 }
            if(b.errorDecrypting) { return -1 }
            return a.created_at < b.created_at ? -1 : 1;
          });

          const winningItem = sorted[0];
          // Delete all items after first one
          const itemsToDelete = sorted.slice(1, sorted.length);
          for(const deleteItem of itemsToDelete) {
            this.modelManager.setItemToBeDeleted(deleteItem);
          }

          this.syncManager.sync();

          // Send remaining item to callback
          singletonHandler.singleton = winningItem;
          singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(winningItem);
        } else if(allExtantItemsMatchingPredicate.length == 1) {
          const singleton = allExtantItemsMatchingPredicate[0];
          if(singleton.errorDecrypting) {
            // Delete the current singleton and create a new one
            this.modelManager.setItemToBeDeleted(singleton);
            handleCreation();
          } else if(!singletonHandler.singleton || singletonHandler.singleton !== singleton) {
            // Not yet notified interested parties of object
            singletonHandler.singleton = singleton;
            singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(singleton);
          }
        }
      } else {
        // Retrieved items does not include any items of interest. If we don't have a singleton registered to this handler,
        // we need to create one. Only do this on actual sync completetions and not on initial data load. Because we want
        // to get the latest from the server before making the decision to create a new item
        if(!singletonHandler.singleton && !initialLoad && !singletonHandler.pendingCreateBlockCallback) {
          handleCreation();
        }
      }
    }
  }
}

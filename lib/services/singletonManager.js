/*
  The SingletonManager allows controllers to register an item as a singleton, which means only one instance of that model
  should exist, both on the server and on the client. When the SingletonManager detects multiple items matching the singleton predicate,
  the oldest ones will be deleted, leaving the newest ones. (See 4/28/18 update. We now choose the earliest created one as the winner.).

  (This no longer fully applies, See 4/28/18 update.) We will treat the model most recently arrived from the server as the most recent one. The reason for this is,
  if you're offline, a singleton can be created, as in the case of UserPreferneces. Then when you sign in, you'll retrieve your actual user preferences.
  In that case, even though the offline singleton has a more recent updated_at, the server retreived value is the one we care more about.

  4/28/18: I'm seeing this issue: if you have the app open in one window, then in another window sign in, and during sign in,
  click Refresh (or autorefresh occurs) in the original signed in window, then you will happen to receive from the server the newly created
  Extensions singleton, and it will be mistaken (it just looks like a regular retrieved item, since nothing is in saved) for a fresh, latest copy, and replace the current instance.
  This has happened to me and many users.
  A puzzling issue, but what if instead of resolving singletons by choosing the one most recently modified, we choose the one with the earliest create date?
  This way, we don't care when it was modified, but we always, always choose the item that was created first. This way, we always deal with the same item.
*/

import { SFModelManager } from '@Services/modelManager'
import { SFPredicate } from '@Models/core/predicate'

export class SFSingletonManager {

  constructor(modelManager, syncManager) {
    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.singletonHandlers = [];

    // We use sync observer instead of syncEvent `local-data-incremental-load`, because we want singletons
    // to resolve with the first priority, because they generally dictate app state.
    // If we used local-data-incremental-load, and 1 item was important singleton and 99 were heavy components,
    // then given the random nature of notifiying observers, the heavy components would spend a lot of time loading first,
    // here, we priortize ours loading as most important
    modelManager.addItemSyncObserverWithPriority({
      id: "sf-singleton-manager",
      types: "*",
      priority: -1,
      callback: (allItems, validItems, deletedItems, source, sourceKey) => {
        // Inside resolveSingletons, we are going to set items as dirty. If we don't stop here it will be infinite recursion.
        if(source === SFModelManager.MappingSourceLocalDirtied) {
          return;
        }
        this.resolveSingletons(modelManager.allNondummyItems, null, true);
      }
    })

    syncManager.addEventHandler((syncEvent, data) => {
      if(syncEvent == "local-data-loaded") {
        this.resolveSingletons(modelManager.allNondummyItems, null, true);
        this.initialDataLoaded = true;
      } else if(syncEvent == "sync:completed") {
        // Wait for initial data load before handling any sync. If we don't want for initial data load,
        // then the singleton resolver won't have the proper items to work with to determine whether to resolve or create.
        if(!this.initialDataLoaded) {
          return;
        }
        // The reason we also need to consider savedItems in consolidating singletons is in case of sync conflicts,
        // a new item can be created, but is never processed through "retrievedItems" since it is only created locally then saved.

        // HOWEVER, by considering savedItems, we are now ruining everything, especially during sign in. A singleton can be created
        // offline, and upon sign in, will sync all items to the server, and by combining retrievedItems & savedItems, and only choosing
        // the latest, you are now resolving to the most recent one, which is in the savedItems list and not retrieved items, defeating
        // the whole purpose of this thing.

        // Updated solution: resolveSingletons will now evaluate both of these arrays separately.
        this.resolveSingletons(data.retrievedItems, data.savedItems);
      }
    });

    /*
      If an item alternates its uuid on registration, singletonHandlers might need to update
      their local reference to the object, since the object reference will change on uuid alternation
    */
    modelManager.addModelUuidChangeObserver("singleton-manager", (oldModel, newModel) => {
      for(let handler of this.singletonHandlers) {
        if(handler.singleton && SFPredicate.ItemSatisfiesPredicates(newModel, handler.predicates)) {
          // Reference is now invalid, calling resolveSingleton should update it
          handler.singleton = null;
          this.resolveSingletons([newModel]);
        }
      }
    })
  }

  registerSingleton(predicates, resolveCallback, createBlock) {
    /*
    predicate: a key/value pair that specifies properties that should match in order for an item to be considered a predicate
    resolveCallback: called when one or more items are deleted and a new item becomes the reigning singleton
    createBlock: called when a sync is complete and no items are found. The createBlock should create the item and return it.
    */
    this.singletonHandlers.push({
      predicates: predicates,
      resolutionCallback: resolveCallback,
      createBlock: createBlock
    });
  }

  resolveSingletons(retrievedItems, savedItems, initialLoad) {
    retrievedItems = retrievedItems || [];
    savedItems = savedItems || [];

    for(let singletonHandler of this.singletonHandlers) {
      let predicates = singletonHandler.predicates.slice();
      let retrievedSingletonItems = this.modelManager.filterItemsWithPredicates(retrievedItems, predicates);

      let handleCreation = () => {
        if(singletonHandler.createBlock) {
          singletonHandler.pendingCreateBlockCallback = true;
          singletonHandler.createBlock((created) => {
            singletonHandler.singleton = created;
            singletonHandler.pendingCreateBlockCallback = false;
            singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(created);
          });
        }
      }

      // We only want to consider saved items count to see if it's more than 0, and do nothing else with it.
      // This way we know there was some action and things need to be resolved. The saved items will come up
      // in filterItemsWithPredicate(this.modelManager.allNondummyItems) and be deleted anyway
      let savedSingletonItemsCount = this.modelManager.filterItemsWithPredicates(savedItems, predicates).length;

      if(retrievedSingletonItems.length > 0 || savedSingletonItemsCount > 0) {
        /*
          Check local inventory and make sure only 1 similar item exists. If more than 1, delete newest
          Note that this local inventory will also contain whatever is in retrievedItems.
        */
        let allExtantItemsMatchingPredicate = this.modelManager.itemsMatchingPredicates(predicates);

        /*
          Delete all but the earliest created
        */
        if(allExtantItemsMatchingPredicate.length >= 2) {
          let sorted = allExtantItemsMatchingPredicate.sort((a, b) => {
            /*
              If compareFunction(a, b) is less than 0, sort a to an index lower than b, i.e. a comes first.
              If compareFunction(a, b) is greater than 0, sort b to an index lower than a, i.e. b comes first.
            */

            if(a.errorDecrypting) {
              return 1;
            }

            if(b.errorDecrypting) {
              return -1;
            }

            return a.created_at < b.created_at ? -1 : 1;
          });

          // The item that will be chosen to be kept
          let winningItem = sorted[0];

          // Items that will be deleted
          // Delete everything but the first one
          let toDelete = sorted.slice(1, sorted.length);

          for(let d of toDelete) {
            this.modelManager.setItemToBeDeleted(d);
          }

          this.syncManager.sync();

          // Send remaining item to callback
          singletonHandler.singleton = winningItem;
          singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(winningItem);

        } else if(allExtantItemsMatchingPredicate.length == 1) {
          let singleton = allExtantItemsMatchingPredicate[0];
          if(singleton.errorDecrypting) {
            // Delete the current singleton and create a new one
            this.modelManager.setItemToBeDeleted(singleton);
            handleCreation();
          }
          else if(!singletonHandler.singleton || singletonHandler.singleton !== singleton) {
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

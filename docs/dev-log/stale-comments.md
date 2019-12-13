Removed from syncManager before filtering response.retrieved_items:
  // Filter retrieved_items to remove any items that may be in saved_items for this complete sync operation
  // When signing in, and a user requires many round trips to complete entire retrieval of data, an item may be saved
  // on the first trip, then on subsequent trips using cursor_token, this same item may be returned, since it's date is
  // greater than cursor_token. We keep track of all saved items in whole sync operation with this.allSavedItems
  // We need this because singletonManager looks at retrievedItems as higher precendence than savedItems, but if it comes in both
  // then that's problematic.

Removed from syncManager before awaiting this.handleUnsavedItemsResponse:
  // don't `await`. This function calls sync, so if you wait, it will call sync without having completed the sync we're in.
  // On second thought, calling await will only await the local conflict resolution and not await the sync call.
  // We do need to wait here for sync duplication to finish. If we don't, there seems to be an issue where if you import a large
  // backup with uuid-conflcits (from another account), you'll see very confused duplication.

Removed before this.sync in handleUnsavedItemsResponse:
  // This will immediately result in "Sync op in progress" and sync will be queued.
  // That's ok. You actually want a sync op in progress so that the new items are saved to disk right away.
  // If you add a timeout here of 100ms, you'll avoid sync op in progress, but it will be a few ms before the items
  // are saved to disk, meaning that the user may see All changes saved a few ms before changes are saved to disk.
  // You could also just write to disk manually here, but syncing here is 100% sure to trigger sync op in progress as that's
  // where it's being called from.

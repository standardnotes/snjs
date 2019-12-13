## Sync

It's incredibly important to keep track of the thinking behind the sync algorithm. I can't help but write paragraphs of comments behind every line, so that it's easier to track in the future, but I'm thinking putting it in a dedicated doc might be better.

In May 2019, the sync system is undergoing some refactors to account for the weakness in the ability to account for conflicts via multipage requests. The limitation is clearly demonstrated by two scenarios:

#### Scenario A:

- Upload limit: 2, Download limit: 1
- Create two items and sync them normally.
- Simulate stale items by modifying these items locally, and clearing our sync token. These stale changes reflect out-of-date changes that should not overwrite server values.
- Sync again. Now, both items will be uploaded. On the server, since the limit is 1, only 1 item will be in retrieved_items. When check_for_conflicts is called, since the second item does not appear in retrieved_items, the save will go through immediately. We will then lose whatever value the server had.

#### Scenario B:

- Upload limit: 1, Download limit: 2
- Create two items and sync them normally.
- Simulate stale items by modifying these items locally, and clearing our sync token. These stale changes reflect out-of-date changes that should not overwrite server values, but should also be retained so that we don't lose dirty client changes.
- Sync again. Now, only 1 item will be uploaded, and 2 will be retrieved. On the client, the 2 retrieved are immediately mapped onto the currently dirty values, wiping out the dirty client change.
- Since the upload limit is 1, we still have 1 more item to sync. However, that items values have already been updated by the previous retrieved_items, so the value we sync up will just be the new value.

The previous upload limit was 100, and the download limit was 150. So this issue would only be apparent when performing hundred-item sync requests. These can happen when you're importing data, or if you open up a client that hasn't been synced in months AND has a pending migration. In that case, if a migration marks 600 items as dirty, and the client is also behind by 1200 items, then we begin to see unpredictable behavior with conflict management. Technically the migration manager is not supposed to run any migrations until we're up to date with our sync, but it can't be guaranteed that there won't be a regression in this behavior, or another part of the app does something without such safeguards.

The solution to this problem I am implementing in the 20190520 version of the client and server API is to keep of track of conflicts using the updated_at field. Previously, the only conflict checking mechanism the server employed was to get the intersection of the set of saved items and retrieved items. Anything that appeared in both would be conflicted. Given the unreliability of this approach with the above scenarios, the new system works like so:

- When the client wants to sync an item, it must also send it's updated_at value. (Previously this value was not sent up.)
- The server will attempt to save this incoming value. However, it checks the following:
  - Is the incoming_item.updated_at value less than the server_item.updated_at value?
    - If true, it means the value we are trying to save hasn't been updated with the latest server value. The incoming save will not go through. Instead, we'll return a conflict object that includes the server value. When the client sees this conflict, it will compare the server value with its local value. If the values differ, a duplicate will be created.
    - If the two dates are equal, it means the incoming save is based on up to date information, so the save will go through.
    - The scenario where the incoming date is greater than the server date doesn't seem to have any basis in reality. I can't imagine a scenario where that would happen.
- When the client loops through the response.conflicts array, it will do the following:
  - First, retrieve the current local values of all items appearing in conflicts. Create a frozen record of their values before any changes. If the frozen values contents do not match with the server's values, keep the server value, and create a duplicate with the local's values. We choose to keep-server and not keep-local so that it's more integral with what the server has.

The scenarios from above still require custom conflict work on the client side:

#### Scenario A:

- Upload limit: 2, Download limit: 1
- Create two items and sync them normally.
- Simulate stale items by modifying these items locally, and clearing our sync token. These stale changes reflect out-of-date changes that should not overwrite server values.
- Sync again. Now, both items will be uploaded. On the server, we'll loop through both items. They both have updated_at's less than the server values, so the local changes will be rejected and sent back as conflicts, which contain the server values. The server will also remove this item from retrieved_items, so the client will not receive any items.
- The clients will loop through conflicts. It will freeze local values before any processing. If the frozen values differ from the server value, then we will duplicate the frozen value as a new object, and then map the server item onto our local item, maintaining it as the authoritative source.
- Since we also downloaded 1 item, but there is 1 more item in the cursor_token, we will perform another sync request. This will return the server value again. This server value would overwrite any value we may have processed in the conflict handling in the previous step. This would be fine under the assumption that the client chose the keep-server strategy, but sometimes, the client may choose keep-local if it determines that the local item is being actively edited by the user (such as a note that is undergoing rapid editing). If it is an active item, we will choose to keep the local value as not to disrupt editing.

So, to account for this, the client will also handle retrieved_items in a special way:

- When the client received response.retrieved_items, we'll run them through a filter.
  - If the item in retrieved is also found in either saved_items of the current local sync request, or in allSavedItems of the global sync request, then we remove it from retrieved items. This implies that we never map server values onto local values if we have attempted to save this item in the same global request. If a conflict is necessary, the server will have returned the server value as part of a conflict item.
  - ~~If the item has not yet been saved, because it's coming up still in the global request, which we can determine by checking if localItem.dirty, then we also omit the retrieved_item, but, we create a manual conflict here and add it to the current response.conflicts.~~ Although, why would we need to do create a manual conflict? If the item is dirty, and it's in retrieved_items, it would imply the local value is out of date with the server. In this case, when the item goes to save, it would be conflicted by the server. We should omit it from retrieved_items but not create a conflict.

#### Scenario B:

- Upload limit: 1, Download limit: 2
- Create two items and sync them normally.
- Simulate stale items by modifying these items locally, and clearing our sync token. These stale changes reflect out-of-date changes that should not overwrite server values.
- Sync again. Now, 1 item will be sent up, and 2 will be received. The 1 item will be conflicted. The 2 items received however stand to immediately map onto our currently dirty values for the other item that has not yet been sent up.
- However, as explained above, we filter through retrieved_items and remove anything that is presently dirty.
- Upon next sync, the last item will be sent up, and no items received. The item will have an inferior updated_at date, so it will be returned to client as a conflict, who will keep-server and duplicate with local value.

### Content references changes during conflict handling

Consider the following scenario:

- Upload limit: 2, Download limit: 2 (not relevant in this scenario, so assume they're equal)
- A note and tag are created. The note is added to the tag as a reference.
- Conflict the note by modifying its contents and setting to it an inferior updated_at value. Also conflict the tag by setting an inferior updated_at value, but do not change its contents.
- Sync. The server will now reject both these updates and return them as conflicts. The client will handle these with the keep-server strategy.
- We'll start by looping through the conflicts. We'll freeze the values of all local relevant items before beginning any processing.
- First we check the note. We compare the frozen value to the server value.
  - Since the note was intentionally modified to have different content, we expect a duplicate to be created.
  - When the duplicate is created, it will also be added to the same tag we created. So now, this tag's content.references has changed.
- In the next iteration of the loop, we check the tag. Remember that we didn't intentionally modify the tag, so we don't expect it to be duplicated. We compare the frozen value with the server value.
  - These two values will be equal. We don't create a duplicate. However, even if the values are equal, we still map the server item onto our local item, so that we know its exactly in sync.
  - However, as soon as you do that, you overwrite the changes you made to the tag in the previous iteration of the loop, where the new duplicated note was added to this tag.

To account for this:

- In addition to comparing the frozen value with the server value (which will be equal in this case), we will also compare the current item value with the server value.
- If they are different, but the frozen values are equal, we do a check:
  - If the only difference between the current item ref and the server value are references, then we keep the local references and ignore the server references, and set the existing item as dirty.
  - If the difference is more than references, then we will need to keep both. The server item will be kept, and the local item ref will be duplicated.

### keep-local vs. keep-server

Generally, when a sync conflict occurs, it means the client is trying to save something to the server that has an inferior updated_at value. In this case, since the server has the newer value, we want to keep the server copy as the final version of the item belonging to this UUID, and create a new item with the local item's values.

However, if in the course of rapid typing of an active note there occurs a race condition of some sort, we don't want to overwrite whatever the user is typing with the server value, and move what the user was typing into a new note. This would be very jarring, especially on mobile, where it would be impossible to tell that a conflict was created.

So, when looping through conflicts, we check the following:
- If the local item's client_updated_at is within X seconds (let's say 20 seconds), we will choose a keep-local strategy. That is, the local version of the note will keep its uuid, and the server value will move into a new uuid. Both items will need to be dirtied and synced in this case.
- Otherwise, we choose the default keep-server strategy. In this case, only the new duplicate item will need to be dirtied and synced.

(As part of this, we'll also be modifying item.setDirty behavior so that it does not update client_updated_at by default. It must be explicitly told to do so.)

### Deletion

If client A deletes an item, and a client with an outdated sync token modifies this item with a change, we want to keep the local changes. This is one out of two possible approaches: we could also say that if the server says this item is deleted, then it must be deleted everywhere, no exceptions. However, one drawback to that is if the user opens the outdated client, forgets the item was deleted, and makes a change, then this change will be lost if we say the server has the final word.

We're going with the delete-all approach. There should be no reason that we keep an item on any device if one of them has called for a delete.

What an item is marked as deleted locally, but not on the server? In that case it must also be marked as dirty. The practical example is if a client marks the item to be deleted, and loses connection right away. Then from another client some changes are made to this item. Then back on the first client, we retrieve the server item which says the item is not deleted, but the client says it is. In this case, we want to keep the server copy, and ignore the client wanting to delete this item.

### Latency

What if while a user is typing on a slow connection, and old response comes in? That is:

- User begins typing, and first sync request goes out. This request will take 10s to come back.
- User types 20 more times, and we haven't synced anything yet. So this item is still dirty, and we're waiting for the original request to complete.

This is handled by the fact that every time you mark an item as dirty, it's dirtyCount goes up. Before an item is officially about to be synced, we set its dirtyCount as 0. When a sync request completes, we only clear that item as dirty if its dirtyCount is still 0. If the dirty count is greater than 0, we know the item has been dirtied again since we began syncing it.

### Syncing while local data has not yet loaded

Local data must be fully loaded before we accept anything from the server. This is because if we retrieve items from the server before local data has loaded, then their values will be overwritten by the local data values immediately on load. Instead, we must wait until local data has fully loaded before talking to the server.

The interface allows users to create new notes while their data is loading, and also edit any notes that may have already loaded. In this case, we need to make sure that while any pending changes will not be synced to the server yet, dirty values should be saved to local disk upon someone calling syncManager.sync(). The previous behavior was that we would lock syncing, including saving dirty items to disk, until all local data has loaded. This would mean that if a user made a new note, typed a sentence, all while their 10,000 items have not yet fully loaded, and then suddenly quit the app, their changes may be unsaved.

- What if a user makes a change to a note, then gets it saved locally, before local data load has even started. Then, upon local data load, this item appears 5,000 items later, by which time, you modified the in memory copy several times. This would then overwrite the changes you've made. To handle this, we'll persist dirtiedDate to local storage. Upon local data load, we check if the saved value's dirtiedDate is less than the current item (if it exists in modelManager) dirtiedDate. If it is, we'll ignore this local value.

- Clients **must** call syncManager.loadLocalItems and wait for that to complete before calling syncManager.sync. Ideally these two would be combined into one, but for now, they remain separate and up to the consumer to ensure proper order. Calling syncManager.sync before loadLocalItems has completed will save dirty items to disk, but will not proceed with online sync.

- When a user signs out, assuming we don't reload the interface (we do reload on web but not mobile), then we will keep the flag that indicates that local data has loaded. The client is not required to call loadLocalItems after a sign out.

### Dirty

Items coming back from the server on a fresh sign in on will be saved to disk with the `dirty` and `dirtiedDate` values `undefined`. Items created locally will have these values be defined. But if you ever see undefined, that's why.

### Null updated_at value

Since updated_at is such an important field, we need to handle the case when it may have no value, for whatever reason. Assume for example that you import a backup file and for some reason the updated_at fields are corrupted. In this case, we would want to default the updated_at value to 1970-01-01. This will essentially convey to the server that this item should be treated as an old change, and to conflict as necessary.  

### Syncing while syncing

Let's say a client wants to await a sync request and do something when it completes. Let's say there's an automatic timer than syncs every 10 seconds, but each sync request takes 20 seconds to complete. In this case, if we always await when syncManager.performSyncAgainOnCompletion is true, then the client's initial await will never resolve, as it will continue looping. We can pass an option to sync called 'chainWithCurrentResolveCycle', and if true, then 

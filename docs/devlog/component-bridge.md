### Component manager on the client side

When sending items to extensions, we include a parameter called "isMetadataUpdate". isMetadataUpdate implies that the extension should make reference of updated metadata, but not update content values as they may be stale relative to what the extension currently has. Changes are always metadata updates if the mapping source is SNModelManager.MappingSourceRemoteSaved || source == SNModelManager.MappingSourceLocalSaved.

There are a few scenarios worth mentioning:

- Say you have an editor and the action bar below it, which counts how many words are in the note. When you make a change from the editor, we call a save-items event, and the componentManager handles that by immediately mapping whatever value the extension gives to us onto our local item. This happens before any remote sync, and all happens locally. This mapping has type SNModelManager.MappingSourceComponentRetrieved. When this mapping happens, componentManager's itemSyncObserver will be notified of a change to to this item. It will loop through all extensions that are interested in this item. However, one of those extensions will be the originating editor itself. We don't want to send this editor the same value that it just gave us.
  - In this case, we will have access to the sourceKey value in the item observer. This will be the uuid of the component that triggered this change. If while looping the iterated extension uuid is equal to the sourceKey, we skip that extension and do not send it any messages. Otherwise, all other extensions receive this value immediately, and it will not be a `isMetadataUpdate`, so the extensions will immediately reflect this value onto the UI.

- Now, say the remote sync for this item completes. We don't want any extensions to update any content values here, since their contents should already have been updated via prior mappings. We wants `isMetadataUpdate` to be true. The way we determine this is simply if the source is SNModelManager.MappingSourceRemoteSaved || SNModelManager.MappingSourceLocalSaved.

- What if I set the title of a note? Will extensions be notified with `isMetadataUpdate` false, as should be? In the current situation, extensions are only notified of a title content change after the save completes. And they do have `isMetadataUpdate` to true, which extensions really should be ignoring.
  - The solution is to add to modelManager a function called setItemDirty. It will mark the item as dirty/not and it will also notify observers. This way extensions get notified right away.
  - In the case of creating a new item, observers are also notified immediately via modelManager.createItem.

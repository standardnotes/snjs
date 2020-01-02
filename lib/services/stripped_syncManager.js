export class SNSyncManager {

  /*
    Executes a sync request with a blank sync token and high download limit. It will download all items,
    but won't do anything with them other than decrypting, creating respective objects, and returning them to caller. (it does not map them nor establish their relationships)
    The use case came primarly for clients who had ignored a certain content_type in sync, but later issued an update
    indicated they actually did want to start handling that content type. In that case, they would need to download all items
    freshly from the server.
  */
  stateless_downloadAllItems(options = {}) {
    return new Promise(async (resolve, reject) => {
      let params = {
        limit: options.limit || 500,
        sync_token: options.syncToken,
        cursor_token: options.cursorToken,
        content_type: options.contentType,
        event: options.event
      };

      try {
        this.httpManager.postAuthenticatedAbsolute(await this.getSyncURL(), params, async (response) => {
          if(!options.retrievedItems) {
            options.retrievedItems = [];
          }

          const encryptedPayloads = response.retrieved_items.map((retrievedPayload) => {
            return CreatePayloadFromAnyObject({
              object: retrievedPayload,
              ource: MAPPING_SOURCE_REMOTE_RETRIEVED
            });
          })
          const decryptedPayloads = await this.protocolManager.payloadsByDecryptingPayloads({
            payloads: encryptedPayloads
          });
          const items = decryptedPayloads.map((payload) => {
            return CreateItemFromPayload(payload);
          });

          options.retrievedItems = options.retrievedItems.concat(items);
          options.syncToken = response.sync_token;
          options.cursorToken = response.cursor_token;

          if(options.cursorToken) {
            this.stateless_downloadAllItems(options).then(resolve);
          } else {
            resolve(options.retrievedItems);
          }
        }, (response, statusCode) => {
          reject(response);
        });
      } catch(e) {
        console.log("Download all items exception caught:", e);
        reject(e);
      }
    });
  }

  async resolveOutOfSync() {
    // Sync all items again to resolve out-of-sync state
    return this.stateless_downloadAllItems({event: "resolve-out-of-sync"}).then(async (downloadedItems) => {
      let payloadsToMap = [];
      for(let downloadedItem of downloadedItems) {
        // Note that deleted items will not be sent back by the server.
        let existingItem = this.modelManager.findItem(downloadedItem.uuid);
        if(existingItem) {
          // Check if the content differs. If it does, create a new item, and do not map downloadedItem.
          let contentDoesntMatch = !downloadedItem.isItemContentEqualWith(existingItem);
          if(contentDoesntMatch) {
            // We create a copy of the local existing item and sync that up. It will be a "conflict" of itself
            await this.modelManager.duplicateItemAndAddAsConflict(existingItem);
          }
        }

        const payload = CreatePayloadFromAnyObject({
          object: downloadedItem,
          source: MAPPING_SOURCE_REMOTE_RETRIEVED
        })

        // Map the downloadedItem as authoritive content. If client copy at all differed, we would have created a duplicate of it above and synced it.
        // This is also neccessary to map the updated_at value from the server
        payloadsToMap.push(payload);
      }

      await this.modelManager.mapPayloadsToLocalItems({
        payloads: payloadsToMap,
        source: MAPPING_SOURCE_REMOTE_RETRIEVED
      });
      // Save all items locally. Usually sync() would save downloaded items locally, but we're using stateless_sync here, so we have to do it manually
      await this.writeItemsToLocalStorage(this.modelManager.allNondummyItems);
      return this.sync({checkIntegrity: true});
    })
  }
}

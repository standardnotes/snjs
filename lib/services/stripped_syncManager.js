export class SNSyncManager {

  beginCheckingIfSyncIsTakingTooLong() {
    if(this.syncStatus.checker) {
      this.stopCheckingIfSyncIsTakingTooLong();
    }
    this.syncStatus.checker = this.$interval(function(){
      // check to see if the ongoing sync is taking too long, alert the user
      let secondsPassed = (new Date() - this.syncStatus.syncStart) / 1000;
      let warningThreshold = 5.0; // seconds
      if(secondsPassed > warningThreshold) {
        this.notifyEvent("sync:taking-too-long");
        this.stopCheckingIfSyncIsTakingTooLong();
      }
    }.bind(this), 500)
  }

  stopCheckingIfSyncIsTakingTooLong() {
    if(this.$interval.hasOwnProperty("cancel")) {
      this.$interval.cancel(this.syncStatus.checker);
    } else {
      clearInterval(this.syncStatus.checker);
    }
    this.syncStatus.checker = null;
  }

  async sync(options = {}) {
      let isContinuationSync = this.syncStatus.needsMoreSync;
      this.syncStatus.syncStart = new Date();
      this.beginCheckingIfSyncIsTakingTooLong();

      if(options.onPreSyncSave) {
        options.onPreSyncSave();
      }

      let params = {};
      params.limit = this.ServerItemDownloadLimit;

      if(options.performIntegrityCheck) {
        params.compute_integrity = true;
      }

      try {
        const payloads = [];
        for(let item of subItems) {
          const payload = CreatePayloadFromAnyObject({object: item});
          const encryptedPayload = await this.protocolManager.payloadByEncryptingPayload({
            payload: payload,
            intent: ENCRYPTION_INTENT_SYNC
          })
          payloads.push(encryptedPayload);
        }

        params.items = payloads;
      } catch (e) {
        console.error("Error generating sync item params", e);
        this.notifyEvent("sync-exception", e);
      }

      for(let item of subItems) {
        // Reset dirty counter to 0, since we're about to sync it.
        // This means anyone marking the item as dirty after this will cause it so sync again and not be cleared on sync completion.
        item.dirtyCount = 0;
      }

      params.sync_token = await this.getSyncToken();
      params.cursor_token = await this.getCursorToken();

      params['api'] = SNHttpManager.getApiVersion();

      if(this.loggingEnabled)  {
        console.log("Syncing with params", params);
      }

      try {
        this.httpManager.postAuthenticatedAbsolute(await this.getSyncURL(), params, (response) => {
          this.handleSyncSuccess(subItems, response, options).then(() => {
            resolve(response);
          }).catch((e) => {
            console.error("Caught sync success exception:", e);
            this.handleSyncError(e, null, allDirtyItems).then((errorResponse) => {
              this.notifyEvent("sync-exception", e);
              resolve(errorResponse);
            });
          });
        }, (response, statusCode) => {
          this.handleSyncError(response, statusCode, allDirtyItems).then((errorResponse) => {
            resolve(errorResponse);
          });
        });
      }
      catch(e) {
        console.log("Sync exception caught:", e);
      }
    });
  }

  async handleSyncSuccess(syncedItems, response, options) {
    // Used for testing
    if(options.simulateHighLatency) {
      let latency = options.simulatedLatency || 1000;
      await this._awaitSleep(latency);
    }

    this.stopCheckingIfSyncIsTakingTooLong();
  }

  async handleSyncError(response, statusCode, allDirtyItems) {
    console.error("Sync error: ", response);

    if(statusCode == 401) {
      this.notifyEvent("sync-session-invalid");
    }

    if(!response) {
      response = {error: {message: "Could not connect to server."}};
    } else if(typeof response == 'string') {
      response = {error: {message: response}};
    }

    this.syncStatus.syncOpInProgress = false;
    this.syncStatus.error = response.error;
    this.syncStatusDidChange();

    this.writeItemsToLocalStorage(allDirtyItems, false);
    this.modelManager.didSyncItemsOffline(allDirtyItems);

    this.stopCheckingIfSyncIsTakingTooLong();

    this.notifyEvent("sync:error", response.error);

    this.callQueuedCallbacks({error: "Sync error"});

    return response;
  }

  async refreshErroredItems() {
    let erroredItems = this.modelManager.allNondummyItems.filter((item) => {
      return item.errorDecrypting == true
    });
    if(erroredItems.length > 0) {
      return this.handleItemsResponse(
        erroredItems,
        null,
        MAPPING_SOURCE_LOCAL_RETRIEVED,
        SNSyncManager.KeyRequestLoadSaveAccount
      );
    }
  }

  // Legacy API
  async deprecated_handleUnsavedItemsResponse(unsaved) {
    if(!unsaved || unsaved.length == 0) {
      return;
    }

    if(this.loggingEnabled) {
      console.log("Handle Unsaved Items:", unsaved);
    }

    for(let mapping of unsaved) {
      let itemResponse = mapping.item;
      const payload = CreatePayloadFromAnyObject({object: itemResponse});
      const decryptedPayload = await this.protocolManager.payloadByDecryptingPayload({payload: payload});
      let item = this.modelManager.findItem(itemResponse.uuid);

      // Could be deleted
      if(!item) { continue; }

      let error = mapping.error;

      if(error.tag === "uuid_conflict") {
        // UUID conflicts can occur if a user attempts to
        // import an old data archive with uuids from the old account into a new account
        await this.modelManager.alternateUUIDForItem(item);
      }

      else if(error.tag === "sync_conflict") {
        // Create a new item with the same contents of this item if the contents differ
        let dup = await this.modelManager.createDuplicateItemFromPayload(decryptedPayload);
        if(!itemResponse.deleted && !item.isItemContentEqualWith(dup)) {
          this.modelManager.addDuplicatedItemAsConflict({duplicate: dup, duplicateOf: item});
        }
      }
    }
  }

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
        event: options.event,
        api: SNHttpManager.getApiVersion()
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
      return this.sync({performIntegrityCheck: true});
    })
  }
}

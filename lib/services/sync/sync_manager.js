import { removeFromIndex } from '@Lib/utils';

export class SyncManager {

  async itemsNeedingSync() {
    return this.modelManager.getDirtyItems();
  }

  async markItemsSynced(items) {
    this.modelManager.clearDirtyItems(items);
  }

  async payloadsNeedingPreSyncSave(from) {
    return from.filter((candidate) => {
      return !this.lastPreSyncSave || (candidate.dirtiedDate > this.lastPreSyncSave);
    })
  }

  timingStrategyResolveOnNext() {
    return new Promise((resolve, reject) => {
      this.resolveQueue.push(resolve);
    });
  }

  timingStrategyForceSpawnNew() {
    return new Promise((resolve, reject) => {
      this.spawnQueue.push({resolve, reject});
    });
  }

  resolveQueuedCallbacks() {
    for(const callback of this.queuedCallbacks) {
      callback.resolve();
    }
    this.queuedCallbacks = [];
  }

  popSpawnQueue() {
    if(this.spawnQueue.length === 0) {
      return null;
    }
    const promise = this.spawnQueue[0];
    removeFromIndex(this.spawnQueue, 0);
    return this.sync().then(() => {
      promise.resolve();
    }).catch(() => {
      promise.reject();
    })
  }

  /**
   * @param timingStrategy  TIMING_STRATEGY_RESOLVE_ON_NEXT - default
   *                        Promise will be resolved on the next sync requests after the current one completes.
   *                        If there is no scheduled sync request, one will be scheduled.
   *                        TIMING_STRATEGY_FORCE_SPAWN_NEW
   *                        A new sync request is guarenteed to be generated for your request, no matter how long it takes.
   *                        Promise will be resolved whenever this sync request is processed in the serial queue.
   */

  async sync({timingStrategy}) {
    const items = this.itemsNeedingSync();
    const decryptedPayloads = items.map((item) => {
      CreatePayloadFromAnyObject({
        object: item
      })
    });

    const needsSaveEncrypted = this.protocolManager.payloadsByEncryptingPayloads({
      payloads: this.payloadsNeedingPreSyncSave(decryptedPayloads),
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    })
    await this.storageManager.savePayloads({
      payloads: needsSaveEncrypted
    });

    /** The resolve queue before we add any new elements to it below */
    const inTimeResolveQueue = this.resolveQueue.slice();

    const useStrategy = (
      isNullOrUndefined(timingStrategy)
      ? TIMING_STRATEGY_RESOLVE_ON_NEXT
      : TIMING_STRATEGY_FORCE_SPAWN_NEW
    );
    if(this.currentOperation && this.currentOperation.running) {
      this.log('Attempting to sync while existing sync in progress.');
      if(useStrategy === TIMING_STRATEGY_RESOLVE_ON_NEXT) {
        return this.timingStrategyPiggybackOnCurrentOperation();
      } else if(useStrategy === TIMING_STRATEGY_FORCE_SPAWN_NEW) {
        return this.timingStrategyForceSpawnNew();
      } else {
        throw `Unhandled timing strategy ${strategy}`;
      }
    }

    const encryptedPayloads = this.protocolManager.payloadsByEncryptingPayloads({
      payloads: decryptedPayloads,
      intent: ENCRYPTION_INTENT_SYNC
    });

    let operation;
    if(this.authManager.online()) {
      operation = this.syncOnlineOperation(encryptedPayloads);
    } else {
      operation = this.syncOffline(encryptedPayloads);
    }
    this.currentOperation = operation;
    await operation.run();

    for(const callback of inTimeResolveQueue) {
      callback.resolve();
    }
    subtractFromArray(this.resolveQueue, inTimeResolveQueue);

    if(!this.popSpawnQueue() && this.resolveQueue.length > 0) {
      this.sync();
    }
  }


  /**
   * @private
   */
  async syncOnlineOperation(encryptedPayloads) {
    const operation = new AccountSyncOperation({
      url: this.authManager.getServerUrl(),
      payloads: encryptedPayloads,
      receiver: (signal, type) => {
        if(type === SIGNAL_TYPE_SERVER_RESPONSE) {
          this.handleServerResponse(signal);
        } else if(type === SIGNAL_TYPE_STATUS_CHANGED) {
          this.handleStatusChange(operation);
        }
      }
    })
    return operation;
  }

  async syncOfflineOperation(encryptedPayloads) {
    const operation = new OfflineSyncOperation({
      payloads: encryptedPayloads,
      receiver: (signal, type) => {
        if(type === SIGNAL_TYPE_OFFLINE_RESPONSE) {
          this.handleOfflineResponse(signal);
        } else if(type === SIGNAL_TYPE_STATUS_CHANGED) {
          this.handleStatusChange(operation);
        }
      }
    })
    return operation;
  }

  async handleStatusChange(operation) {
    const savedCount = operation.savedCount();
    const downloadedCount = operation.downloadedCount();
    const pendingUploadCount = operaiton.pendingUploadCount();
    const totalUploadCount = operation.totalUploadCount();
    const completedUploadCount = totalUploadCount - pendingUploadCount;

    this.setStatus({
      string: `${completedUploadCount}/${totalUploadCount}`
    });
  }

  async setStatus(status) {
    this.status = status;
  }

  async handleOfflineResponse(response) {

  }

  async handleServerResponse(response) {
    const idsOfInterest = response.idsOfInterest();
    const itemsOfInterest = this.modelManager.findItems(idsOfInterest);
    const currentItemPayloads = itemsOfInterest.map((item) => {
      return CreatePayloadFromAnyObject({
        object: item
      });
    })

    const decryptedPayloads = response.allProcessedPayloads.map((payload) => {
      return this.protocolManager.payloadByDecryptingPayload({payload});
    })

    const resolver = new AccountSyncResponseResolver({
      request: request,
      response: response,
      decryptedResponsePayloads: decryptedPayloads,
      currentItemPayloads: currentItemPayloads
    });

    const payloads = await resolver.run();
    await this.modelManager.mapPayloadsToLocalItems({payloads});
    const saveTask = new SyncTaskPersistLocally({payloads: payloads});
    await saveTask.run();

    if(response.needsMoreSync()) {
      this.sync();
    }
  }

  log(message) {
    if(this.loggingEnabled) {
      console.log(message);
    }
  }
}

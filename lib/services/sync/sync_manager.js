import { removeFromIndex, sleep } from '@Lib/utils';
import { SortPayloadsByRecentAndContentPriority } from '@Services/sync/utils';
import { SyncStatus } from '@Services/sync/sync_status';
import { SyncState } from '@Services/sync/sync_state';
import { AccountDownloader } from '@Services/sync/account_downloader';
import * as events from '@Services/sync/events';
import {
  STORAGE_KEY_LAST_SYNC_TOKEN,
  STORAGE_KEY_PAGINATION_TOKEN
} from '@Protocol/storageKeys';

const DEFAULT_DATABASE_LOAD_BATCH_SIZE  = 100;
const DEFAULT_MAX_DISCORDANCE           = 5;
const DEFAULT_MAJOR_CHANGE_THRESHOLD    = 15;
const INVALID_SESSION_RESPONSE_STATUS   = 401;

export class SyncManager {

  constructor({
    sessionManager,
    databaseManager,
    protocolManager,
    modelManager,
    apiService
  }) {
    this.sessionManager = sessionManager;
    this.databaseManager = databaseManager;
    this.protocolManager = protocolManager;
    this.modelManager = modelManager;
    this.apiService = apiService;

    this.statusObservers = [];
    this.eventObservers = [];

    this.majorChangeThreshold = DEFAULT_MAJOR_CHANGE_THRESHOLD;
    this.maxDiscordance = DEFAULT_MAX_DISCORDANCE;
    this.status = new SyncStatus();
    this.initializeState();

    /** Content types appearing first are always mapped first */
    this.localLoadPriorty = [
      'SN|ItemsKey',
      'SN|UserPreferences',
      'SN|Privileges',
      'SN|Component',
      'SN|Theme'
    ];
  }

  initializeState() {
    this.state = new SyncState({
      maxDiscordance: maxDiscordance,
      receiver: (event) => {
        if(event === SYNC_EVENT_SYNC_DISCORDANCE_CHANGE) {
          if(this.state.syncDiscordance < this.maxDiscordance) {
            this.sync();
          }
        } else if(event === SYNC_EVENT_ENTER_OUT_OF_SYNC) {
          this.notifyEvent(SYNC_EVENT_ENTER_OUT_OF_SYNC);
        } else if(event === SYNC_EVENT_EXIT_OUT_OF_SYNC) {
          this.notifyEvent(SYNC_EVENT_EXIT_OUT_OF_SYNC);
        }
      },
    });
  }

  lockSyncing() {
    this.locked = true;
  }

  unlockSyncing() {
    this.locked = false;
  }

  addEventObserver(observer) {
    this.eventObservers.push(observer);
    return handler;
  }

  removeEventObserver(observer) {
    pull(this.eventObservers, observer);
  }

  notifyEvent(syncEvent, data) {
    for(let observer of this.eventObservers) {
      observer.callback(syncEvent, data || {});
    }
  }

  addStatusObserver(observer) {
    this.statusObservers.push(observer);
    return observer;
  }

  removeStatusObserver(observer) {
    pull(this.statusObservers, observer);
  }

  statusDidChange() {
    this.statusObservers.forEach((observer) => {
      observer.callback(this.syncStatus);
    })
  }

  /**
   * Loads and maps initial data from database, then executes the first sync request.
   */
  initializeLocalDatabase() {
    if(this.databaseInitialized) {
      throw 'Attempting to initialize already initialized local database.';
    }
    await this.databaseManager.openDatabase();

    const unsortedPayloads = await this.storageManager.getAllPayloads();
    const payloads = SortPayloadsByRecentAndContentPriority(
      unsortedPayloads,
      this.localLoadPriorty
    );

    /** Map in batches to give interface a chance to update */
    const payloadCount = payloads.length;
    const batchSize = DEFAULT_DATABASE_LOAD_BATCH_SIZE;
    const numBatches = Math.ceil(payloadCount/batchSize);

    for(let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const currentPosition = batchIndex * batchSize;
      const batch = payloads.slice(currentPosition, currentPosition + batchSize);
      const decrypted = this.protocolManager.payloadsByDecryptingPayloads({
        payloads: batch
      })
      await this.modelManager.mapPayloadsToLocalItems({
        payloads: payloads,
        source: MAPPING_SOURCE_LOCAL_RETRIEVED
      });

      this.notifyEvent(events.SYNC_EVENT_LOCAL_DATA_INCREMENTAL_LOAD);
      this.status.setLocalDataLoadStatus({
        current: current,
        total: payloadCount
      })
    }
    this.databaseInitialized = true;
    this.notifyEvent(events.SYNC_EVENT_LOCAL_DATA_LOADED);
  }

  async setLastSyncToken(token) {
    this.syncToken = token;
    return this.storageManager.setValue(STORAGE_KEY_LAST_SYNC_TOKEN, token);
  }

  async setPaginationToken(token) {
    this.cursorToken = token;
    if(token) {
      return this.storageManager.setValue(STORAGE_KEY_PAGINATION_TOKEN, token);
    } else {
      return await this.storageManager.removeValue(STORAGE_KEY_PAGINATION_TOKEN);
    }
  }

  async getLastSyncToken() {
    if(!this.syncToken) {
      this.syncToken = await this.storageManager.getValue(STORAGE_KEY_LAST_SYNC_TOKEN);
    }
    return this.syncToken;
  }

  async getPaginationToken() {
    if(!this.cursorToken) {
      this.cursorToken = await this.storageManager.getValue(STORAGE_KEY_PAGINATION_TOKEN);
    }
    return this.cursorToken;
  }

  async clearSyncPositionTokens() {
    this.syncToken = null;
    this.cursorToken = null;
    await this.storageManager.removeValue(STORAGE_KEY_LAST_SYNC_TOKEN);
    await this.storageManager.removeValue(STORAGE_KEY_PAGINATION_TOKEN);
  }

  async popItemsNeedingSync() {
    const items = this.modelManager.getDirtyItems();
    /**
     * Reset dirty counter to 0, since we're about to sync it.
     * Anyone marking the item dirty after this will cause it so sync again.
     */
    for(const item of items) {
      item.dirtyCount = 0;
    }
    return items;
  }

  /**
   * Mark all items as dirty and needing sync, then persist to storage.
   * @param alternateUuids  In the case of signing in and merging local data, we alternate UUIDs
   *                        to avoid overwriting data a user may retrieve that has the same UUID.
   *                        Alternating here forces us to to create duplicates of the items instead.
   */
  async markAllItemsAsNeedingSync({alternateUuids}) {
    if(alternateUUIDs) {
      /** Make a copy of the array, as alternating uuid will affect array */
      const items = this.modelManager.allNondummyItems.filter((item) => {
        return !item.errorDecrypting
      }).slice();
      for(const item of items) {
        await this.modelManager.alternateUUIDForItem(item);
      }
    }

    const items = this.modelManager.allNondummyItems;
    const payloads = items.map((item) => {
      return CreatePayloadFromAnyObject({
        object: item,
        override: {
          dirty: true
        }
      })
    })
    await this.persistPayloads({
      decryptedPayloads: payloads
    })
  }

  /**
   * Return the payloads that need local persistence, before beginning a sync.
   * This way, if the application is closed before a sync request completes,
   * pending data will be saved to disk, and synced the next time the app opens.
   */
  async popPayloadsNeedingPreSyncSave(from) {
    const lastPreSyncSave = this.state.lastPreSyncSaveDate;
    if(!lastPreSyncSave) {
      return from;
    }
    const payloads = from.filter((candidate) => {
      return candidate.dirtiedDate > lastPreSyncSave;
    })
    this.state.setLastPresaveSyncDate(new Date());
    return payloads;
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

  /**
   * For timing strategy TIMING_STRATEGY_FORCE_SPAWN_NEW, we will execute a whole sync request
   * and pop it from the queue.
   */
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
   * @param timingStrategy  TIMING_STRATEGY_RESOLVE_ON_NEXT | Default
   *                        Promise will be resolved on the next sync requests after the current one completes.
   *                        If there is no scheduled sync request, one will be scheduled.
   *
   *                        TIMING_STRATEGY_FORCE_SPAWN_NEW
   *                        A new sync request is guarenteed to be generated for your request, no matter how long it takes.
   *                        Promise will be resolved whenever this sync request is processed in the serial queue.

   * @param checkIntegrity  Whether the server should compute and return an integrity hash.
   */
  async sync({timingStrategy, checkIntegrity}) {
    if(this.locked) {
      this.log('Sync Locked');
      return;
    }

    const items = this.popItemsNeedingSync();
    const decryptedPayloads = items.map((item) => {
      CreatePayloadFromAnyObject({
        object: item
      })
    });

    const payloadsNeedingSave = this.popPayloadsNeedingPreSyncSave(decryptedPayloads);
    const needsSaveEncrypted = this.protocolManager.payloadsByEncryptingPayloads({
      payloads: payloadsNeedingSave,
      intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
    });
    await this.persistPayloads({
      encryptedPayloads: needsSaveEncrypted
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
        return this.timingStrategyResolveOnNext();
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

    this.status.setDidBegin();

    let operation;
    if(this.sessionManager.online()) {
      operation = this.syncOnlineOperation({
        payloads: encryptedPayloads,
        checkIntegrity: checkIntegrity
      });
    } else {
      operation = this.syncOfflineOperation({payloads: encryptedPayloads});
    }
    this.currentOperation = operation;
    await operation.run();

    this.status.setDidEnd();

    /**
     * For timing strategy TIMING_STRATEGY_RESOLVE_ON_NEXT.
     * Execute any callbacks pulled before this sync request began.
     */
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
  async syncOnlineOperation({payloads, checkIntegrity}) {
    this.log('Syncing online user');
    const operation = new AccountSyncOperation({
      apiService: this.apiService,
      payloads: payloads,
      checkIntegrity: checkIntegrity,
      lastSyncToken: await this.getLastSyncToken(),
      paginationToken: await this.getPaginationToken(),
      receiver: (signal, type) => {
        if(type === SIGNAL_TYPE_SERVER_RESPONSE) {
          this.handleSuccessServerResponse({operation, response: signal});
        } else if(type === SIGNAL_TYPE_STATUS_CHANGED) {
          this.handleStatusChange({operation});
        }
      }
    })
    return operation;
  }

  async syncOfflineOperation({payloads}) {
    const operation = new OfflineSyncOperation({
      payloads: payloads,
      receiver: (signal, type) => {
        if(type === SIGNAL_TYPE_OFFLINE_RESPONSE) {
          this.handleOfflineResponse(signal);
        } else if(type === SIGNAL_TYPE_STATUS_CHANGED) {
          this.handleStatusChange({operation});
        }
      }
    })
    return operation;
  }

  async handleStatusChange({operation}) {
    const pendingUploadCount = operaiton.pendingUploadCount();
    const totalUploadCount = operation.totalUploadCount();
    const completedUploadCount = totalUploadCount - pendingUploadCount;
    this.status.setUploadStatus({
      completed: completedUploadCount,
      total: totalUploadCount
    });
  }

  async setStatus(status) {
    this.status = status;
  }

  async handleOfflineResponse(response) {
    const payloads = response.payloads;
    await this.persistPayloads({
      encryptedPayloads: payloads
    });
    this.modelManager.mapPayloadsToLocalItems({
      payload: payloads,
      source: MAPPING_SOURCE_LOCAL_SAVED
    })
    this.notifyEvent(events.SYNC_EVENT_SYNC_COMPLETED);
  }

  async handleErrorServerResponse({operation, response}) {
    this.log('Sync Error', response);
    if(response.status === INVALID_SESSION_RESPONSE_STATUS) {
      this.notifyEvent(events.SYNC_EVENT_INVALID_SESSION);
    }

    this.status.setError(response.error);
    this.notifyEvent(SYNC_EVENT_SYNC_ERROR, response.error);
  }

  async handleSuccessServerResponse({operation, response}) {
    if(this._simulate_latency) { await sleep(this._simulate_latency.latency) }
    this.log('Sync Response', response);
    this.setLastSyncToken(response.lastSyncToken);
    this.setPaginationToken(response.paginationToken);
    this.status.clearError();

    const decryptedPayloads = response.allProcessedPayloads.map((payload) => {
      return this.protocolManager.payloadByDecryptingPayload({payload});
    });
    const masterCollection = this.modelManager.getMasterCollection();
    const resolver = new AccountSyncResponseResolver({
      response: response,
      decryptedResponsePayloads: decryptedPayloads,
      payloadsSavedOrSaving: operation.payloadsSavedOrSaving,
      masterCollection: masterCollection,
    });

    const payloads = await resolver.run();
    await this.modelManager.mapPayloadsToLocalItems({
      payloads: payloads,
      source: MAPPING_SOURCE_REMOTE_RETRIEVED
    });

    await this.persistPayloads({
      decryptedPayloads: payloads
    });

    if(response.checkIntegrity) {
      const clientHash = await this.protocolManager.computeDataIntegrityHash();
      this.state.setIntegrityHashes({
        clientHash: clientHash,
        serverHash: response.integrityHash
      })
    }

    this.notifyEvent(SYNC_EVENT_SINGLE_SYNC_COMPLETED);

    if(resolver.needsMoreSync()) {
      this.sync();
    }
  }

  async handleSyncOperationCompletion({operation}) {
    if(operation.numberOfItemsInvolved >= this.majorChangeThreshold ) {
      this.notifyEvent(events.SYNC_EVENT_MAJOR_DATA_CHANGE);
    }
    this.status.reset();
    this.notifyEvent(events.SYNC_EVENT_FULL_SYNC_COMPLETED);
  }

  async persistPayloads({encryptedPayloads, decryptedPayloads}) {
    const newlyEncrypted = (decryptedPayloads || []).map(async (payload) => {
      return await this.protocolManager.payloadByEncryptingPayload({
        payload: payload,
        intent: ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
      })
    })

    const allPayloads = (encryptedPayloads || []).concat(newlyEncrypted)''
    await this.storageManager.savePayloads({
      payloads: allPayloads
    });
  }

  async handleSignOut() {
    this.state.reset();
    this.syncStatus.reset();
    this.resolveQueue = [];
    this.spawnQueue = [];
    await this.clearSyncPositionTokens();
  }

  stateless_downloadAllItems({contentType, customEvent} = {}) {
    return AccountDownloader.downloadAllPayloads({
      apiService: this.apiService,
      protocolManager: this.protocolManager,
      contentType: contentType,
      customEvent: customEvent
    }).then((allPayloads) => {
      return allPayloads.map((payload) => {
        return CreateItemFromPayload(payload);
      });
    })
  }

  /** Downloads all items and maps to lcoal items to attempt resolve out-of-sync state */
  async resolveOutOfSync() {
    const payloads = AccountDownloader.downloadAllPayloads({
      apiService: this.apiService,
      protocolManager: this.protocolManager,
      customEvent: "resolve-out-of-sync"
    });

    const results = [];
    for(const payload of payloads) {
      const existingItem = this.modelManager.findItem(payload.uuid);
      if(existingItem) {
        const contentDiffers = !item.isItemContentEqualWith(existingItem);
        if(contentDiffers) {
          const existingPayload = CreatePayloadFromAnyObject({
            object: existingItem
          });
          /**
           * We create a copy of the local existing item and sync that up.
           * It will be a "conflict" of itself
           */
          const resultingPayloads = existingPayload.payloadsByCopying({
            isConflict: true,
            masterCollection: this.modelManager.getMasterCollection()
          })
          extendArray(results, resultingPayloads);
        }
      }
      const payload = CreatePayloadFromAnyObject({
        object: item,
        source: MAPPING_SOURCE_REMOTE_RETRIEVED
      })
      /**
       * Map the item as authoritive content. If client copy at all differed,
       * we would have created a duplicate of it above and synced it.
       * This is also neccessary to map the updated_at value from the server
       */
      results.push(payload);
    }

    await this.modelManager.mapPayloadsToLocalItems({
      payloads: results,
      source: MAPPING_SOURCE_REMOTE_RETRIEVED
    });
    await this.persistPayloads({
      decryptedPayloads: results
    });
    return this.sync({checkIntegrity: true});
  }

  /** For testing */
  beginLatencySimulator() {
    this.latency_sim = {
      latency: 1000,
      enabled: true
    }
  }

  endLatencySimulator() {
    this.latency_sim = null;
  }

  log(message, object) {
    if(this.loggingEnabled) {
      console.log(message, object);
    }
  }
}

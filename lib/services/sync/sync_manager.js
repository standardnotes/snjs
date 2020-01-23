import { removeFromIndex, sleep, subtractFromArray } from '@Lib/utils';
import { PureService } from '@Services/pure_service';
import { SortPayloadsByRecentAndContentPriority } from '@Services/sync/utils';
import { SyncOpStatus } from '@Services/sync/sync_op_status';
import { SyncState } from '@Services/sync/sync_state';
import { AccountDownloader } from '@Services/sync/account/downloader';
import { AccountSyncResponseResolver } from '@Services/sync/account/response_resolver';
import { AccountSyncOperation } from '@Services/sync/account/operation';
import { OfflineSyncOperation } from '@Services/sync/offline/operation';
import * as events from '@Services/events';
import { ITEM_PAYLOAD_CONTENT } from '@Payloads/fields';
import {
  PayloadCollection,
  CreateSourcedPayloadFromObject,
  payloadClassForSource
} from '@Payloads';
import { DeltaOutOfSync } from '@Payloads/deltas';
import { CreateItemFromPayload } from '@Models/generator';
import { CONTENT_TYPE_ITEMS_KEY } from '@Models/content_types';
import {
  SIGNAL_TYPE_RESPONSE,
  SIGNAL_TYPE_STATUS_CHANGED
} from '@Services/sync/signals';
import {
  STORAGE_KEY_LAST_SYNC_TOKEN,
  STORAGE_KEY_PAGINATION_TOKEN
} from '@Lib/storage_keys';

const DEFAULT_DATABASE_LOAD_BATCH_SIZE  = 100;
const DEFAULT_MAX_DISCORDANCE           = 5;
const DEFAULT_MAJOR_CHANGE_THRESHOLD    = 15;
const INVALID_SESSION_RESPONSE_STATUS   = 401;

export const TIMING_STRATEGY_RESOLVE_ON_NEXT = 1;
export const TIMING_STRATEGY_FORCE_SPAWN_NEW = 2;

export const SYNC_MODE_DEFAULT  = 1;
export const SYNC_MODE_INITIAL  = 2;

export class SNSyncManager extends PureService {
  constructor({
    sessionManager,
    protocolService,
    storageManager,
    modelManager,
    apiService,
    interval
  }) {
    super();
    this.sessionManager = sessionManager;
    this.protocolService = protocolService;
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.apiService = apiService;
    this.interval = interval;

    this.statusObservers = [];
    this.resolveQueue = [];
    this.spawnQueue = [];

    this.majorChangeThreshold = DEFAULT_MAJOR_CHANGE_THRESHOLD;
    this.maxDiscordance = DEFAULT_MAX_DISCORDANCE;
    this.initializeStatus();
    this.initializeState();

    /** Content types appearing first are always mapped first */
    this.localLoadPriorty = [
      CONTENT_TYPE_ITEMS_KEY,
      'SN|UserPreferences',
      'SN|Privileges',
      'SN|Component',
      'SN|Theme'
    ];
  }

  initializeStatus() {
    this.opStatus = new SyncOpStatus({
      interval: this.interval,
      receiver: (event) => {
        this.notifyEvent(event);
      }
    });
  }

  initializeState() {
    this.state = new SyncState({
      maxDiscordance: this.maxDiscordance,
      receiver: (event) => {
        if(event === events.SYNC_EVENT_ENTER_OUT_OF_SYNC) {
          this.notifyEvent(events.SYNC_EVENT_ENTER_OUT_OF_SYNC);
        } else if(event === events.SYNC_EVENT_EXIT_OUT_OF_SYNC) {
          this.notifyEvent(events.SYNC_EVENT_EXIT_OUT_OF_SYNC);
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

  addStatusObserver(observer) {
    this.statusObservers.push(observer);
    return observer;
  }

  removeStatusObserver(observer) {
    pull(this.statusObservers, observer);
  }

  statusDidChange() {
    this.statusObservers.forEach((observer) => {
      observer(this.SyncOpStatus);
    })
  }

  isOutOfSync() {
    return this.state.isOutOfSync();
  }

  getLastSyncDate() {
    return this.state.lastSyncDate;
  }

  async getDatabasePayloads() {
    return this.storageManager.getAllRawPayloads();
  }

  async loadDatabasePayloads(rawPayloads) {
    if(this.databaseLoaded) {
      throw 'Attempting to initialize already initialized local database.';
    }

    const unsortedPayloads = rawPayloads.map((rawPayload) => {
      return CreateMaxPayloadFromAnyObject({
        object: rawPayload
      })
    })
    const payloads = SortPayloadsByRecentAndContentPriority(
      unsortedPayloads,
      this.localLoadPriorty
    );

    /** Decrypt and map items keys first */
    const itemsKeysPayloads = payloads.filter((payload) => {
      return payload.content_type === CONTENT_TYPE_ITEMS_KEY;
    });
    subtractFromArray(payloads, itemsKeysPayloads);
    const decryptedItemsKeys = await this.protocolService
    .payloadsByDecryptingPayloads({
      payloads: itemsKeysPayloads
    })
    await this.modelManager.mapPayloadsToLocalItems({
      payloads: decryptedItemsKeys,
      source: PAYLOAD_SOURCE_LOCAL_RETRIEVED
    });

    /** Map in batches to give interface a chance to update */
    const payloadCount = payloads.length;
    const batchSize = DEFAULT_DATABASE_LOAD_BATCH_SIZE;
    const numBatches = Math.ceil(payloadCount/batchSize);
    for(let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const currentPosition = batchIndex * batchSize;
      const batch = payloads.slice(currentPosition, currentPosition + batchSize);
      const decrypted = await this.protocolService
      .payloadsByDecryptingPayloads({
        payloads: batch
      });
      await this.modelManager.mapPayloadsToLocalItems({
        payloads: decrypted,
        source: PAYLOAD_SOURCE_LOCAL_RETRIEVED
      });
      this.notifyEvent(
        events.SYNC_EVENT_LOCAL_DATA_INCREMENTAL_LOAD
      );
      this.opStatus.setDatabaseLoadStatus({
        current: currentPosition,
        total: payloadCount
      })
    }
    this.opStatus.setDatabaseLoadStatus({
      done: true
    })
    this.notifyEvent(
      events.SYNC_EVENT_LOCAL_DATA_LOADED
    );
    this.databaseLoaded = true;
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

  async itemsNeedingSync() {
    const items = this.modelManager.getDirtyItems();
    return items;
  }

  /**
   * Mark all items as dirty and needing sync, then persist to storage.
   * @param alternateUuids  In the case of signing in and merging local data, we alternate UUIDs
   *                        to avoid overwriting data a user may retrieve that has the same UUID.
   *                        Alternating here forces us to to create duplicates of the items instead.
   */
  async markAllItemsAsNeedingSync({alternateUuids} = {}) {
    if(alternateUuids) {
      /** Make a copy of the array, as alternating uuid will affect array */
      const items = this.modelManager.allNondummyItems.filter((item) => {
        return !item.errorDecrypting
      }).slice();
      for(const item of items) {
        await this.modelManager.alternateUuidForItem(item);
      }
    }

    const items = this.modelManager.allNondummyItems;
    const payloads = items.map((item) => {
      return CreateMaxPayloadFromAnyObject({
        object: item,
        override: {
          dirty: true
        }
      })
    })
    await this.modelManager.mapPayloadsToLocalItems({
      payloads: payloads
    })
    await this.persistPayloads({
      decryptedPayloads: payloads
    })
  }

  /**
   * @public
   * If encryption status changes (esp. on mobile, where local storage encryption
   * can be disabled), consumers may call this function to repersist all items to
   * disk using latest encryption status.
   */
  async repersistAllItems() {
    const items = this.modelManager.allItems;
    const payloads = items.map((item) => {
      return CreateMaxPayloadFromAnyObject({
        object: item
      })
    })
    return this.persistPayloads({
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
    /** dirtiedDate can be null if the payload was created as dirty */
    const payloads = from.filter((candidate) => {
      return !candidate.dirtiedDate || candidate.dirtiedDate > lastPreSyncSave;
    })
    this.state.setLastPresaveSyncDate(new Date());
    return payloads;
  }

  timingStrategyResolveOnNext() {
    return new Promise((resolve, reject) => {
      this.resolveQueue.push({resolve, reject});
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
    this.log('Syncing again from spawn queue');
    return this.sync({
      timingStrategy: TIMING_STRATEGY_FORCE_SPAWN_NEW
    }).then(() => {
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
   *
   * @param mode            SYNC_MODE_DEFAULT
   *                        Performs a standard sync, uploading any dirty items and retrieving items.
   *                        SYNC_MODE_INITIAL
   *                        The first sync for an account, where we first want to download all remote items first
   *                        before uploading any dirty items. This allows a consumer, for example, to download
   *                        all data to see if user has an items key, and if not, only then create a new one.
   * @param checkIntegrity  Whether the server should compute and return an integrity hash.
   */
  async sync({timingStrategy, mode, checkIntegrity} = {}) {
    if(this.locked) {
      this.log('Sync Locked');
      return;
    }

    const items = await this.itemsNeedingSync();
    /**
     * Items that have never been synced and marked as deleted should not be
     * uploaded to server, and instead deleted directly after sync completion.
     */
    const neverSyncedDeleted = items.filter((item) => {
      return item.neverSynced && item.deleted;
    })
    subtractFromArray(items, neverSyncedDeleted);

    const decryptedPayloads = items.map((item) => {
      return CreateMaxPayloadFromAnyObject({
        object: item
      })
    });

    const payloadsNeedingSave = await this.popPayloadsNeedingPreSyncSave(
      decryptedPayloads
    );
    await this.persistPayloads({
      decryptedPayloads: payloadsNeedingSave
    });

    /** The resolve queue before we add any new elements to it below */
    const inTimeResolveQueue = this.resolveQueue.slice();

    const useStrategy = (
      !isNullOrUndefined(timingStrategy)
      ? timingStrategy
      : TIMING_STRATEGY_RESOLVE_ON_NEXT
    );
    const syncInProgress = this.opStatus.syncInProgress;
    const databaseLoaded = this.databaseLoaded;
    if(syncInProgress || !databaseLoaded) {
      this.log(
        syncInProgress ?
        'Attempting to sync while existing sync in progress.' :
        'Attempting to sync before local database has loaded.'
      );
      if(useStrategy === TIMING_STRATEGY_RESOLVE_ON_NEXT) {
        return this.timingStrategyResolveOnNext();
      } else if(useStrategy === TIMING_STRATEGY_FORCE_SPAWN_NEW) {
        return this.timingStrategyForceSpawnNew();
      } else {
        throw `Unhandled timing strategy ${strategy}`;
      }
    }

    /** Lock syncing immediately after checking in progress above */
    this.opStatus.setDidBegin();

    /**
     * Marking items dirty after lastSyncBegan will cause them to sync again.
     */
    const beginDate = new Date();
    await this.modelManager.setItemsProperties({
      items: items,
      properties: {
        lastSyncBegan: beginDate
      }
    });

    const useMode = (
      !isNullOrUndefined(mode)
      ? mode
      : SYNC_MODE_DEFAULT
    );
    const online = await this.sessionManager.online();
    let uploadPayloads;
    if(useMode === SYNC_MODE_DEFAULT) {
      if(!this.completedInitialSync) {
        throw 'Attempting to default mode sync without having completed initial.';
      }
      uploadPayloads = await this.protocolService.payloadsByEncryptingPayloads({
        payloads: decryptedPayloads,
        intent: online
                ? ENCRYPTION_INTENT_SYNC
                : ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED
      });
    } else if(useMode === SYNC_MODE_INITIAL) {
      uploadPayloads = [];
    }

    let operation;
    if(online) {
      operation = await this.syncOnlineOperation({
        payloads: uploadPayloads,
        checkIntegrity: checkIntegrity
      });
    } else {
      operation = await this.syncOfflineOperation({
        payloads: uploadPayloads
      });
    }
    await operation.run();

    this.opStatus.setDidEnd();

    /**
     * For timing strategy TIMING_STRATEGY_RESOLVE_ON_NEXT.
     * Execute any callbacks pulled before this sync request began.
     */
    for(const callback of inTimeResolveQueue) {
      callback.resolve();
    }
    subtractFromArray(this.resolveQueue, inTimeResolveQueue);
    if(!this.popSpawnQueue() && this.resolveQueue.length > 0) {
      this.log('Syncing again from resolve queue');
      /** No need to await. */
      this.sync();
    }

    await this.handleSyncOperationCompletion({operation});
    await this.handleNeverSyncedDeleted(neverSyncedDeleted);

    if(useMode === SYNC_MODE_INITIAL) {
      this.completedInitialSync = true;
      await this.notifyEvent(events.SYNC_EVENT_INITIAL_SYNC_COMPLETED);
      /** Perform regular sync now that we've finished download first sync */
      return this.sync();
    } else if((await this.itemsNeedingSync()).length > 0) {
      /**
       * As part of the just concluded sync operation, more items may have
       * been dirtied (like conflicts), and the caller may want to await the
       * full resolution of these items.
       */
      return this.sync();
    }
  }

  /**
   * @private
   */
  async syncOnlineOperation({payloads, checkIntegrity}) {
    this.log('Syncing online user', payloads);
    const operation = new AccountSyncOperation({
      apiService: this.apiService,
      payloads: payloads,
      checkIntegrity: checkIntegrity,
      lastSyncToken: await this.getLastSyncToken(),
      paginationToken: await this.getPaginationToken(),
      receiver: async (signal, type) => {
        if(type === SIGNAL_TYPE_RESPONSE) {
          const response = signal;
          if(response.hasError) {
            await this.handleErrorServerResponse({operation, response});
          } else {
            await this.handleSuccessServerResponse({operation, response});
          }
        } else if(type === SIGNAL_TYPE_STATUS_CHANGED) {
          await this.handleStatusChange({operation});
        }
      }
    })
    return operation;
  }

  async syncOfflineOperation({payloads}) {
    this.log('Syncing offline user', payloads);
    const operation = new OfflineSyncOperation({
      payloads: payloads,
      receiver: async (signal, type) => {
        if(type === SIGNAL_TYPE_RESPONSE) {
          await this.handleOfflineResponse(signal);
        } else if(type === SIGNAL_TYPE_STATUS_CHANGED) {
          await this.handleStatusChange({operation});
        }
      }
    })
    return operation;
  }

  async handleStatusChange({operation}) {
    const pendingUploadCount = operaiton.pendingUploadCount();
    const totalUploadCount = operation.totalUploadCount();
    const completedUploadCount = totalUploadCount - pendingUploadCount;
    this.opStatus.setUploadStatus({
      completed: completedUploadCount,
      total: totalUploadCount
    });
  }

  async handleOfflineResponse(response) {
    this.log('Offline Sync Response', response);
    const decryptedPayloads = response.payloads;
    await this.persistPayloads({
      decryptedPayloads: decryptedPayloads
    });
    await this.modelManager.mapPayloadsToLocalItems({
      payloads: decryptedPayloads,
      source: PAYLOAD_SOURCE_LOCAL_SAVED
    })
  }

  async handleErrorServerResponse({operation, response}) {
    this.log('Sync Error', response);
    if(response.status === INVALID_SESSION_RESPONSE_STATUS) {
      this.notifyEvent(events.SYNC_EVENT_INVALID_SESSION);
    }

    this.opStatus.setError(response.error);
    this.notifyEvent(events.SYNC_EVENT_SYNC_ERROR, response.error);
  }

  async handleSuccessServerResponse({operation, response}) {
    if(this._simulate_latency) { await sleep(this._simulate_latency.latency) }
    this.log('Online Sync Response', response);
    this.setLastSyncToken(response.lastSyncToken);
    this.setPaginationToken(response.paginationToken);
    this.opStatus.clearError();

    const decryptedPayloads = [];
    for(const payload of response.allProcessedPayloads) {
      if(payload.deleted || !payload.fields().includes(ITEM_PAYLOAD_CONTENT)) {
        /**
        * Deleted payloads, and some payload types
        * do not contiain content (like remote saved)
        */
        continue;
      }
      const decrypted = await this.protocolService.payloadByDecryptingPayload({
        payload: payload
      });
      decryptedPayloads.push(decrypted);
    }
    const masterCollection = this.modelManager.getMasterCollection();
    const resolver = new AccountSyncResponseResolver({
      response: response,
      decryptedResponsePayloads: decryptedPayloads,
      payloadsSavedOrSaving: operation.payloadsSavedOrSaving,
      baseCollection: masterCollection,
    });

    const collections = await resolver.collectionsByProcessingResponse();
    for(const collection of collections) {
      await this.modelManager.mapCollectionToLocalItems({
        collection: collection
      });
      let payloadsToPersist;
      const payloadClass = payloadClassForSource(collection.source);
      if(!payloadClass.fields().includes(ITEM_PAYLOAD_CONTENT)) {
        /** Before persisting, merge with current base value that has content field */
        payloadsToPersist = collection.allPayloads.map((payload) => {
          const base = masterCollection.findPayload(payload.uuid);
          return base.mergedWith(payload);
        })
      } else {
        payloadsToPersist = collection.allPayloads;
      }
      await this.persistPayloads({
        decryptedPayloads: payloadsToPersist
      });
    }

    await this.notifyEvent(
      events.SYNC_EVENT_SINGLE_SYNC_COMPLETED
    );

    if(response.checkIntegrity) {
      const clientHash = await this.computeDataIntegrityHash();
      await this.state.setIntegrityHashes({
        clientHash: clientHash,
        serverHash: response.integrityHash
      })
      if(this.state.needsSync && operation.done) {
        this.sync();
      }
    }
  }

  async handleSyncOperationCompletion({operation}) {
    this.opStatus.reset();
    this.state.setLastSyncDate(new Date());
    if(operation.numberOfItemsInvolved >= this.majorChangeThreshold ) {
      this.notifyEvent(events.SYNC_EVENT_MAJOR_DATA_CHANGE);
    }
    await this.notifyEvent(events.SYNC_EVENT_FULL_SYNC_COMPLETED);
  }

  /**
   * @private
   * Items that have never been synced and marked as deleted should be cleared
   * as dirty, mapped, then removed from storage.
   */
  async handleNeverSyncedDeleted(items) {
    const payloads = items.map((item) => {
      return item.payloadRepresentation({
        override: {
          dirty: false
        }
      })
    });
    await this.modelManager.mapPayloadsToLocalItems({payloads: payloads});
    await this.persistPayloads({decryptedPayloads: payloads});
  }

  async persistPayloads({decryptedPayloads = []}) {
    if(decryptedPayloads.length === 0) {
      return;
    }
    await this.storageManager.savePayloads(decryptedPayloads);
  }

  /**
   * Computes a hash of all items updated_at strings joined with a comma.
   * The server will also do the same, to determine whether the client values match server values.
   * @returns A SHA256 digest string (hex).
   */
  async computeDataIntegrityHash() {
    try {
      const items = this.modelManager.nonDeletedItems.sort((a, b) => {
        return b.updated_at - a.updated_at;
      })
      const dates = items.map((item) => item.updatedAtTimestamp());
      const string = dates.join(',');
      return this.protocolService.crypto.sha256(string);
    } catch (e) {
      console.error("Error computing data integrity hash", e);
      return null;
    }
  }

  async handleSignOut() {
    this.state.reset();
    this.opStatus.reset();
    this.resolveQueue = [];
    this.spawnQueue = [];
    await this.clearSyncPositionTokens();
  }

  /** Downloads all items and maps to lcoal items to attempt resolve out-of-sync state */
  async resolveOutOfSync() {
    const payloads = await AccountDownloader.downloadAllPayloads({
      apiService: this.apiService,
      protocolService: this.protocolService,
      customEvent: "resolve-out-of-sync"
    });

    const delta = new DeltaOutOfSync({
      baseCollection: this.modelManager.getMasterCollection(),
      applyCollection: new PayloadCollection({
        payloads: payloads,
        source: PAYLOAD_SOURCE_REMOTE_RETRIEVED
      })
    });

    const collection = await delta.resultingCollection();
    await this.modelManager.mapCollectionToLocalItems({
      collection: collection
    });
    await this.persistPayloads({
      decryptedPayloads: collection.payloads
    });
    return this.sync({
      checkIntegrity: true
    });
  }

  async stateless_downloadAllItems({contentType, customEvent} = {}) {
    const downloader = new AccountDownloader({
      apiService: this.apiService,
      protocolService: this.protocolService,
      contentType: contentType,
      customEvent: customEvent
    });

    const payloads = await downloader.run();
    return payloads.map((payload) => {
      return CreateItemFromPayload(payload);
    });
  }

  /** @unit_testing */
  ut_setDatabaseLoaded(loaded) {
    this.databaseLoaded = loaded;
  }

  /** @unit_testing */
  ut_beginLatencySimulator(latency) {
    this._simulate_latency = {
      latency: latency || 1000,
      enabled: true
    }
  }

  /** @unit_testing */
  ut_endLatencySimulator() {
    this._simulate_latency = null;
  }
}

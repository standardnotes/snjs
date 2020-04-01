import { SyncResponse } from '@Services/sync/response';
import { SNItem } from '@Models/core/item';
import { PurePayload } from '@Payloads/pure_payload';
import { SNModelManager } from './../model_manager';
import { SNStorageService } from './../storage_service';
import { SNProtocolService } from './../protocol_service';
import { removeFromIndex, sleep, subtractFromArray, isNullOrUndefined } from '@Lib/utils';
import { PureService } from '@Services/pure_service';
import { SortPayloadsByRecentAndContentPriority } from '@Services/sync/utils';
import { SyncOpStatus } from '@Services/sync/sync_op_status';
import { SyncState } from '@Services/sync/sync_state';
import { AccountDownloader } from '@Services/sync/account/downloader';
import { SyncResponseResolver } from '@Services/sync/account/response_resolver';
import { AccountSyncOperation } from '@Services/sync/account/operation';
import { OfflineSyncOperation } from '@Services/sync/offline/operation';
import { DeltaOutOfSync } from '@Payloads/deltas';
import { PayloadField } from '@Payloads/fields';
import { PayloadSource } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';
import { PayloadsByAlternatingUuid } from '@Payloads/functions';
import { CreateMaxPayloadFromAnyObject, payloadFieldsForSource } from '@Payloads/generator';
import { EncryptionIntent } from '@Protocol/intents';
import { ContentType } from '@Models/content_types';
import { CreateItemFromPayload } from '@Models/generator';
import { SyncSignal } from '@Services/sync/signals';
import { StorageKeys, SyncEvents } from '@Lib/index';
import { SNSessionManager } from '../api/session_manager';
import { SNApiService } from '../api/api_service';

const DEFAULT_DATABASE_LOAD_BATCH_SIZE = 100;
const DEFAULT_MAX_DISCORDANCE = 5;
const DEFAULT_MAJOR_CHANGE_THRESHOLD = 15;
const INVALID_SESSION_RESPONSE_STATUS = 401;


export enum SyncQueueStrategy {
  /**
   * Promise will be resolved on the next sync request after the current one completes.
   * If there is no scheduled sync request, one will be scheduled.
   */
  ResolveOnNext = 1,
  /**
   * A new sync request is guarenteed to be generated for your request, no matter how long it takes.
   * Promise will be resolved whenever this sync request is processed in the serial queue.
   */
  ForceSpawnNew = 2
}

export enum SyncModes {
  /**
   * Performs a standard sync, uploading any dirty items and retrieving items.
   */
  Default = 1,
  /**
   * The first sync for an account, where we first want to download all remote items first
   * before uploading any dirty items. This allows a consumer, for example, to download
   * all data to see if user has an items key, and if not, only then create a new one.
   */
  DownloadFirst = 2
};

export enum SyncSources {
  External = 1,
  SpawnQueue = 2,
  ResolveQueue = 3,
  MoreDirtyItems = 4,
  AfterDownloadFirst = 5,
  IntegrityCheck = 6,
  ResolveOutOfSync = 7
};

export type SyncOptions = {
  queueStrategy?: SyncQueueStrategy
  mode?: SyncModes
  /** Whether the server should compute and return an integrity hash. */
  checkIntegrity?: boolean
  /** Internally used to keep track of how sync requests were spawned. */
  source?: SyncSources
  /** Whether to await any sync requests that may be queued from this call. */
  awaitAll?: boolean
}

type SyncPromise = {
  resolve: (value?: any) => void
  reject: () => void
  options?: SyncOptions
}

/** 
 * The sync service orchestrates with the model manager, api service, and storage service
 * to ensure consistent state between the three. When a change is made to an item, consumers
 * call the sync service's sync function to first persist pending changes to local storage.
 * Then, the items are uploaded to the server. The sync service handles server responses,
 * including mapping any retrieved items to application state via model manager mapping.
 * After each sync request, any changes made or retrieved are also persisted locally.
 * The sync service largely does not perform any task unless it is called upon.
 */
export class SNSyncService extends PureService {

  private sessionManager?: SNSessionManager
  private protocolService?: SNProtocolService
  private storageService?: SNStorageService
  private modelManager?: SNModelManager
  private apiService?: SNApiService
  private interval: any
  private state?: SyncState
  private opStatus?: SyncOpStatus

  private resolveQueue: SyncPromise[] = []
  private spawnQueue: SyncPromise[] = []

  /* A DownloadFirst sync must always be the first sync completed */
  private completedOnlineDownloadFirstSync = false

  private majorChangeThreshold = DEFAULT_MAJOR_CHANGE_THRESHOLD
  private maxDiscordance = DEFAULT_MAX_DISCORDANCE
  private locked = false
  private databaseLoaded = false

  private syncToken?: string
  private cursorToken?: string

  private syncLock?: any
  private _simulate_latency?: any

  /** Content types appearing first are always mapped first */
  private readonly localLoadPriorty = [
    ContentType.ItemsKey,
    ContentType.UserPrefs,
    ContentType.Privileges,
    ContentType.Component,
    ContentType.Theme
  ];
  /**
   * Non-encrypted types are items whose values a server must be able to read.
   * These include server extensions (such as a note history endpoint), and 
   * multi-factor authentication items, which include a secret value that the server
   * needs to be able to read in order to enforce.
   */
  private readonly nonEncryptedTypes = [
    ContentType.Mfa,
    ContentType.ServerExtension
  ];

  constructor(
    sessionManager: SNSessionManager,
    protocolService: SNProtocolService,
    storageService: SNStorageService,
    modelManager: SNModelManager,
    apiService: SNApiService,
    interval: any
  ) {
    super();
    this.sessionManager = sessionManager;
    this.protocolService = protocolService;
    this.modelManager = modelManager;
    this.storageService = storageService;
    this.apiService = apiService;
    this.interval = interval;

    this.initializeStatus();
    this.initializeState();
  }

  /** 
   * If the database has been newly created (because its new or was previously destroyed)
   * we want to reset any sync tokens we have.
   */
  public async onNewDatabaseCreated() {
    if (await this.getLastSyncToken()) {
      await this.clearSyncPositionTokens();
    }
  }

  public deinit() {
    this.sessionManager = undefined;
    this.protocolService = undefined;
    this.modelManager = undefined;
    this.storageService = undefined;
    this.apiService = undefined;
    this.interval = undefined;
    this.state!.reset();
    this.opStatus!.reset();
    this.state = undefined;
    this.opStatus = undefined;
    this.resolveQueue.length = 0;
    this.spawnQueue.length = 0;
    super.deinit();
  }

  private initializeStatus() {
    this.opStatus = new SyncOpStatus(
      this.interval,
      (event) => {
        this.notifyEvent(event);
      }
    );
  }

  private initializeState() {
    this.state = new SyncState(
      (event) => {
        if (event === SyncEvents.EnterOutOfSync) {
          this.notifyEvent(SyncEvents.EnterOutOfSync);
        } else if (event === SyncEvents.ExitOutOfSync) {
          this.notifyEvent(SyncEvents.ExitOutOfSync);
        }
      },
      this.maxDiscordance,
    );
  }

  public lockSyncing() {
    this.locked = true;
  }

  public unlockSyncing() {
    this.locked = false;
  }

  public isOutOfSync() {
    return this.state!.isOutOfSync();
  }

  public getLastSyncDate() {
    return this.state!.lastSyncDate;
  }

  public getStatus() {
    return this.opStatus;
  }

  /** 
   * Called by application when sign in or registration occurs.
   */
  public resetSyncState() {
    this.state!.reset();
  }

  public isDatabaseLoaded() {
    return this.databaseLoaded;
  }

  /** 
   * Used in tandem with `loadDatabasePayloads`
   */
  public async getDatabasePayloads() {
    return this.storageService!.getAllRawPayloads().catch((error) => {
      this.notifyEvent(SyncEvents.DatabaseReadError, error);
      throw error;
    });
  }

  /** 
   * @param rawPayloads - use `getDatabasePayloads` to get these payloads.
   * They are fed as a parameter so that callers don't have to await the loading, but can
   * await getting the raw payloads from storage
   */
  public async loadDatabasePayloads(rawPayloads: any[]) {
    if (this.databaseLoaded) {
      throw 'Attempting to initialize already initialized local database.';
    }

    const unsortedPayloads = rawPayloads.map((rawPayload) => {
      return CreateMaxPayloadFromAnyObject(
        rawPayload
      );
    });
    const payloads = SortPayloadsByRecentAndContentPriority(
      unsortedPayloads,
      this.localLoadPriorty
    );

    /** Decrypt and map items keys first */
    const itemsKeysPayloads = payloads.filter((payload: PurePayload) => {
      return payload.content_type === ContentType.ItemsKey;
    });
    subtractFromArray(payloads, itemsKeysPayloads);
    const decryptedItemsKeys = await this.protocolService!
      .payloadsByDecryptingPayloads(itemsKeysPayloads);
    await this.modelManager!.emitPayloads(
      decryptedItemsKeys,
      PayloadSource.LocalRetrieved
    );

    /** Map in batches to give interface a chance to update */
    const payloadCount = payloads.length;
    const batchSize = DEFAULT_DATABASE_LOAD_BATCH_SIZE;
    const numBatches = Math.ceil(payloadCount / batchSize);
    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const currentPosition = batchIndex * batchSize;
      const batch = payloads.slice(currentPosition, currentPosition + batchSize);
      const decrypted = await this.protocolService!
        .payloadsByDecryptingPayloads(batch);
      await this.modelManager!.emitPayloads(
        decrypted,
        PayloadSource.LocalRetrieved
      );
      this.notifyEvent(
        SyncEvents.LocalDataIncrementalLoad
      );
      this.opStatus!.setDatabaseLoadStatus(
        currentPosition,
        payloadCount,
        false
      );
    }
    this.databaseLoaded = true;
    this.opStatus!.setDatabaseLoadStatus(0, 0, true);
  }

  private async setLastSyncToken(token: string) {
    this.syncToken = token;
    return this.storageService!.setValue(StorageKeys.LastSyncToken, token);
  }

  private async setPaginationToken(token: string) {
    this.cursorToken = token;
    if (token) {
      return this.storageService!.setValue(StorageKeys.PaginationToken, token);
    } else {
      return this.storageService!.removeValue(StorageKeys.PaginationToken);
    }
  }

  private async getLastSyncToken() {
    if (!this.syncToken) {
      this.syncToken = await this.storageService!.getValue(StorageKeys.LastSyncToken);
    }
    return this.syncToken!;
  }

  private async getPaginationToken() {
    if (!this.cursorToken) {
      this.cursorToken = await this.storageService!.getValue(StorageKeys.PaginationToken);
    }
    return this.cursorToken!;
  }

  private async clearSyncPositionTokens() {
    this.syncToken = undefined;
    this.cursorToken = undefined;
    await this.storageService!.removeValue(StorageKeys.LastSyncToken);
    await this.storageService!.removeValue(StorageKeys.PaginationToken);
  }

  private async itemsNeedingSync() {
    const items = this.modelManager!.getDirtyItems();
    return items;
  }

  private async alternateUuidForItem(item: SNItem) {
    const payload = CreateMaxPayloadFromAnyObject(item);
    const results = await PayloadsByAlternatingUuid(
      payload,
      this.modelManager!.getMasterCollection()
    );
    const mapped = await this.modelManager!.emitPayloads(
      results,
      PayloadSource.LocalChanged
    );
    await this.persistPayloads(results);
    return mapped[0];
  }

  /**
   * Mark all items as dirty and needing sync, then persist to storage.
   * @param alternateUuids  
   * In the case of signing in and merging local data, we alternate UUIDs
   * to avoid overwriting data a user may retrieve that has the same UUID.
   * Alternating here forces us to to create duplicates of the items instead.
   */
  public async markAllItemsAsNeedingSync(alternateUuids: boolean) {
    this.log('Marking all items as needing sync');
    if (alternateUuids) {
      /** Make a copy of the array, as alternating uuid will affect array */
      const items = this.modelManager!.allNondummyItems.filter((item) => {
        return !item.errorDecrypting;
      }).slice();
      for (const item of items) {
        await this.alternateUuidForItem(item);
      }
    }
    const items = this.modelManager!.allNondummyItems;
    const payloads = items.map((item) => {
      return CreateMaxPayloadFromAnyObject(
        item,
        undefined,
        undefined,
        {
          dirty: true
        }
      );
    });
    await this.modelManager!.emitPayloads(
      payloads,
      PayloadSource.LocalChanged
    );
    await this.persistPayloads(payloads);
  }

  /**
   * Return the payloads that need local persistence, before beginning a sync.
   * This way, if the application is closed before a sync request completes,
   * pending data will be saved to disk, and synced the next time the app opens.
   */
  private async popPayloadsNeedingPreSyncSave(from: PurePayload[]) {
    const lastPreSyncSave = this.state!.lastPreSyncSave;
    if (!lastPreSyncSave) {
      return from;
    }
    /** dirtiedDate can be null if the payload was created as dirty */
    const payloads = from.filter((candidate) => {
      return !candidate.dirtiedDate || candidate.dirtiedDate > lastPreSyncSave;
    });
    this.state!.lastPreSyncSave = new Date();
    return payloads;
  }

  private queueStrategyResolveOnNext() {
    return new Promise((resolve, reject) => {
      this.resolveQueue.push({ resolve, reject });
    });
  }

  private queueStrategyForceSpawnNew(options: SyncOptions) {
    return new Promise((resolve, reject) => {
      this.spawnQueue.push({ resolve, reject, options });
    });
  }

  /**
   * For timing strategy SyncQueueStrategy.ForceSpawnNew, we will execute a whole sync request
   * and pop it from the queue.
   */
  private popSpawnQueue() {
    if (this.spawnQueue.length === 0) {
      return null;
    }
    const promise = this.spawnQueue[0];
    removeFromIndex(this.spawnQueue, 0);
    this.log('Syncing again from spawn queue');
    return this.sync({
      queueStrategy: SyncQueueStrategy.ForceSpawnNew,
      source: SyncSources.SpawnQueue,
      ...promise.options
    }).then(() => {
      promise.resolve();
    }).catch(() => {
      promise.reject();
    });
  }

  /** 
   * Certain content types should not be encrypted when sending to server, 
   * such as server extensions 
   */
  private payloadsByPreparingForServer(payloads: PurePayload[]) {
    return this.protocolService!.payloadsByEncryptingPayloads(
      payloads,
      (payload) => {
        return (
          this.nonEncryptedTypes.includes(payload.content_type!)
            ? EncryptionIntent.SyncDecrypted
            : EncryptionIntent.Sync
        );
      }
    );
  }

  public async sync(options: SyncOptions = {}): Promise<any> {
    /** Hard locking, does not apply to locking modes below */
    if (this.locked) {
      this.log('Sync Locked');
      return;
    }

    /** 
     * Allows us to lock this function from triggering duplicate network requests.
     * There are two types of locking checks:
     * 1. syncLocked(): If a call to sync() call has begun preparing to be sent to the server.
     *                  but not yet completed all the code below before reaching that point.
     *                  (before reaching opStatus.setDidBegin).
     * 2. syncOpInProgress: If a sync() call is in flight to the server.
     */
    const syncLocked = () => {
      return this.syncLock;
    };
    const captureLock = () => {
      this.syncLock = true;
    };
    const releaseLock = () => {
      this.syncLock = false;
    };

    const syncInProgress = this.opStatus!.syncInProgress;
    const databaseLoaded = this.databaseLoaded;
    const canExecuteSync = !syncLocked();
    if (canExecuteSync && databaseLoaded && !syncInProgress) {
      captureLock();
    }

    if (!options.source) {
      options.source = SyncSources.External;
    }

    const items = await this.itemsNeedingSync();
    /**
     * Items that have never been synced and marked as deleted should not be
     * uploaded to server, and instead deleted directly after sync completion.
     */
    const neverSyncedDeleted = items.filter((item) => {
      return item.neverSynced && item.deleted;
    });
    subtractFromArray(items, neverSyncedDeleted);

    const decryptedPayloads = items.map((item) => {
      return item.payloadRepresentation();
    });

    const payloadsNeedingSave = await this.popPayloadsNeedingPreSyncSave(
      decryptedPayloads
    );
    await this.persistPayloads(payloadsNeedingSave);

    /** The in time resolve queue refers to any sync requests that were made while we still
     * have not sent out the current request. So, anything in the in time resolve queue
     * will have made it in time to piggyback on the current request. Anything that comes
     * _after_ in-time will schedule a new sync request. */
    const inTimeResolveQueue = this.resolveQueue.slice();

    const useStrategy = (
      !isNullOrUndefined(options.queueStrategy)
        ? options.queueStrategy
        : SyncQueueStrategy.ResolveOnNext
    );
    if (syncInProgress || !databaseLoaded || !canExecuteSync) {
      this.log(
        !canExecuteSync ? 'Another function call has begun preparing for sync.' :
          syncInProgress ?
            'Attempting to sync while existing sync in progress.' :
            'Attempting to sync before local database has loaded.'
      );
      if (useStrategy === SyncQueueStrategy.ResolveOnNext) {
        return this.queueStrategyResolveOnNext();
      } else if (useStrategy === SyncQueueStrategy.ForceSpawnNew) {
        return this.queueStrategyForceSpawnNew({
          mode: options.mode,
          checkIntegrity: options.checkIntegrity,
          source: options.source
        });
      } else {
        throw `Unhandled timing strategy ${useStrategy}`;
      }
    }

    /** Lock syncing immediately after checking in progress above */
    this.opStatus!.setDidBegin();
    this.notifyEvent(SyncEvents.SyncWillBegin);
    /* Subtract from array as soon as we're sure they'll be called. 
    resolves are triggered at the end of this function call */
    subtractFromArray(this.resolveQueue, inTimeResolveQueue);

    /** 
     * lastSyncBegan must be set *after* any point we may have returned above. 
     * Setting this value means the item was 100% sent to the server.
     */
    const beginDate = new Date();
    await this.modelManager!.changeItems(
      items,
      {
        lastSyncBegan: beginDate
      }
    );

    const online = this.sessionManager!.online();
    const useMode = ((tryMode) => {
      if (online && !this.completedOnlineDownloadFirstSync) {
        return SyncModes.DownloadFirst;
      } else if (!isNullOrUndefined(tryMode)) {
        return tryMode;
      } else {
        return SyncModes.Default;
      }
    })(options.mode)!;

    let uploadPayloads: PurePayload[] = []
    if (useMode === SyncModes.Default) {
      if (online && !this.completedOnlineDownloadFirstSync) {
        throw 'Attempting to default mode sync without having completed initial.';
      }
      if (online) {
        uploadPayloads = await this.payloadsByPreparingForServer(decryptedPayloads);
      } else {
        uploadPayloads = decryptedPayloads;
      }
    } else if (useMode === SyncModes.DownloadFirst) {
      uploadPayloads = [];
    }

    let operation;
    if (online) {
      operation = await this.syncOnlineOperation(
        uploadPayloads,
        options.checkIntegrity!,
        options.source!,
        useMode
      );
    } else {
      operation = await this.syncOfflineOperation(
        uploadPayloads,
        options.source,
        useMode
      );
    }
    await operation.run();
    this.opStatus!.setDidEnd();
    releaseLock();

    if (this.opStatus!.hasError()) {
      return;
    }

    this.opStatus!.reset();
    this.state!.lastSyncDate = new Date();
    if (
      operation instanceof AccountSyncOperation &&
      operation.numberOfItemsInvolved >= this.majorChangeThreshold
    ) {
      this.notifyEvent(SyncEvents.MajorDataChange);
    }
    await this.handleNeverSyncedDeleted(neverSyncedDeleted);
    if (useMode !== SyncModes.DownloadFirst) {
      await this.notifyEvent(SyncEvents.FullSyncCompleted, { source: options.source });
    }

    if (useMode === SyncModes.DownloadFirst) {
      if (online) {
        this.completedOnlineDownloadFirstSync = true;
      }
      await this.notifyEvent(SyncEvents.DownloadFirstSyncCompleted);
      /** Perform regular sync now that we've finished download first sync */
      await this.sync({
        source: SyncSources.AfterDownloadFirst,
        checkIntegrity: true
      });
    } else if (!this.popSpawnQueue() && this.resolveQueue.length > 0) {
      this.log('Syncing again from resolve queue');
      /** No need to await. */
      const promise = this.sync({ source: SyncSources.ResolveQueue });
      if (options.awaitAll) {
        await promise;
      }
    } else if ((await this.itemsNeedingSync()).length > 0) {
      /**
       * As part of the just concluded sync operation, more items may have
       * been dirtied (like conflicts), and the caller may want to await the
       * full resolution of these items.
       */
      await this.sync({ source: SyncSources.MoreDirtyItems });
    } else if (operation instanceof AccountSyncOperation && operation.checkIntegrity) {
      if (this.state!.needsSync && operation.done) {
        this.log('Syncing again from integrity check');
        const promise = this.sync({
          checkIntegrity: true,
          queueStrategy: SyncQueueStrategy.ForceSpawnNew,
          source: SyncSources.IntegrityCheck
        });
        if (options.awaitAll) {
          await promise;
        }
      }
    } else {
      this.state!.clearIntegrityHashes();
    }
    /**
     * For timing strategy SyncQueueStrategy.ResolveOnNext.
     * Execute any callbacks pulled before this sync request began.
     * Calling resolve on the callbacks should be the last thing we do in this function,
     * to simulate calling .sync as if it went through straight to the end without having
     * to be queued.
     */
    for (const callback of inTimeResolveQueue) {
      callback.resolve();
    }
  }

  private async syncOnlineOperation(
    payloads: PurePayload[],
    checkIntegrity: boolean,
    source: SyncSources,
    mode: SyncModes
  ) {
    this.log('Syncing online user', 'source:', source, 'mode:', mode, 'payloads:', payloads);
    const operation = new AccountSyncOperation(
      payloads,
      async (type: SyncSignal, response?: SyncResponse) => {
        if (type === SyncSignal.Response) {
          if (response!.hasError) {
            await this.handleErrorServerResponse(response!);
          } else {
            await this.handleSuccessServerResponse(operation, response!);
          }
        } else if (type === SyncSignal.StatusChanged) {
          await this.handleStatusChange(operation);
        }
      },
      await this.getLastSyncToken(),
      await this.getPaginationToken(),
      checkIntegrity,
      this.apiService!,
    );
    return operation;
  }

  private async syncOfflineOperation(
    payloads: PurePayload[],
    source: SyncSources,
    mode: SyncModes
  ) {
    this.log('Syncing offline user', 'source:', source, 'mode:', mode, 'payloads:', payloads);
    const operation = new OfflineSyncOperation(
      payloads,
      async (type: SyncSignal, response?: SyncResponse) => {
        if (type === SyncSignal.Response) {
          await this.handleOfflineResponse(response!);
        }
      }
    );
    return operation;
  }

  private async handleStatusChange(operation: AccountSyncOperation) {
    const pendingUploadCount = operation.pendingUploadCount();
    const totalUploadCount = operation.totalUploadCount();
    const completedUploadCount = totalUploadCount - pendingUploadCount;
    this.opStatus!.setUploadStatus(
      completedUploadCount,
      totalUploadCount
    );
  }

  private async handleOfflineResponse(response: SyncResponse) {
    this.log('Offline Sync Response', response.rawResponse);
    const payloadsToMap = response.savedPayloads;
    /** Before persisting, merge with current base value that has content field */
    const masterCollection = this.modelManager!.getMasterCollection();
    const payloadsToPersist = payloadsToMap.map((payload) => {
      const base = masterCollection.findPayload(payload.uuid!);
      return base.mergedWith(payload);
    });
    await this.persistPayloads(payloadsToPersist);
    await this.modelManager!.emitPayloads(
      payloadsToMap,
      PayloadSource.LocalSaved
    );

    this.opStatus!.clearError();
    this.opStatus!.setDownloadStatus(response.retrievedPayloads.length);

    await this.notifyEvent(
      SyncEvents.SingleSyncCompleted,
      response
    );
  }

  private async handleErrorServerResponse(response: SyncResponse) {
    this.log('Sync Error', response);
    if (response.status === INVALID_SESSION_RESPONSE_STATUS) {
      this.notifyEvent(SyncEvents.InvalidSession);
    }

    this.opStatus!.setError(response.error);
    this.notifyEvent(SyncEvents.SyncError, response.error);
  }

  private async handleSuccessServerResponse(
    operation: AccountSyncOperation,
    response: SyncResponse
  ) {
    if (this._simulate_latency) { await sleep(this._simulate_latency.latency); }
    this.log('Online Sync Response', response.rawResponse);
    this.setLastSyncToken(response.lastSyncToken!);
    this.setPaginationToken(response.paginationToken!);
    this.opStatus!.clearError();
    this.opStatus!.setDownloadStatus(
      response.retrievedPayloads.length
    );

    const decryptedPayloads = [];
    for (const payload of response.allProcessedPayloads) {
      if (payload.deleted || !payload.fields.includes(PayloadField.Content)) {
        /* Deleted payloads, and some payload types
          do not contiain content (like remote saved) */
        continue;
      }
      const decrypted = await this.protocolService!.payloadByDecryptingPayload(payload);
      decryptedPayloads.push(decrypted);
    }
    const masterCollection = this.modelManager!.getMasterCollection();
    const resolver = new SyncResponseResolver(
      response,
      decryptedPayloads,
      masterCollection,
      operation.payloadsSavedOrSaving,
    );

    const collections = await resolver.collectionsByProcessingResponse();
    for (const collection of collections) {
      await this.modelManager!.emitCollection(collection);
      let payloadsToPersist;
      const fields = payloadFieldsForSource(collection.source!);
      if (!fields.includes(PayloadField.Content)) {
        /** Before persisting, merge with current base value that has content field */
        payloadsToPersist = collection.getAllPayloads().map((payload) => {
          const base = masterCollection.findPayload(payload.uuid!);
          return base.mergedWith(payload);
        });
      } else {
        payloadsToPersist = collection.getAllPayloads();
      }
      await this.persistPayloads(payloadsToPersist);
    }
    await this.notifyEvent(
      SyncEvents.SingleSyncCompleted,
      response
    );

    if (response.checkIntegrity) {
      const clientHash = await this.computeDataIntegrityHash();
      await this.state!.setIntegrityHashes(
        clientHash!,
        response.integrityHash!
      );
    }
  }

  /**
   * Items that have never been synced and marked as deleted should be cleared
   * as dirty, mapped, then removed from storage.
   */
  private async handleNeverSyncedDeleted(items: SNItem[]) {
    const payloads = items.map((item) => {
      return item.payloadRepresentation(
        {
          dirty: false
        }
      );
    });
    await this.modelManager!.emitPayloads(
      payloads,
      PayloadSource.LocalChanged
    );
    await this.persistPayloads(payloads);
  }

  public async persistPayloads(decryptedPayloads: PurePayload[]) {
    if (decryptedPayloads.length === 0) {
      return;
    }
    return this.storageService!.savePayloads(decryptedPayloads).catch((error) => {
      this.notifyEvent(SyncEvents.DatabaseWriteError, error);
      throw error;
    });
  }

  /**
   * Computes a hash of all items updated_at strings joined with a comma.
   * The server will also do the same, to determine whether the client values match server values.
   * @returns A SHA256 digest string (hex).
   */
  private async computeDataIntegrityHash() {
    try {
      const items = this.modelManager!.nonDeletedItems.sort((a, b) => {
        return b.updated_at?.getTime() - a.updated_at?.getTime();
      });
      const dates = items.map((item) => item.updatedAtTimestamp());
      const string = dates.join(',');
      return this.protocolService!.crypto!.sha256(string);
    } catch (e) {
      console.error('Error computing data integrity hash', e);
      return undefined;
    }
  }

  /** 
   * Downloads all items and maps to lcoal items to attempt resolve out-of-sync state 
   */
  public async resolveOutOfSync() {
    const downloader = new AccountDownloader(
      this.apiService!,
      this.protocolService!,
      undefined,
      'resolve-out-of-sync'
    );
    const payloads = await downloader.run();
    const delta = new DeltaOutOfSync(
      this.modelManager!.getMasterCollection(),
      new PayloadCollection(
        payloads,
        PayloadSource.RemoteRetrieved
      )
    );
    const collection = await delta.resultingCollection();
    await this.modelManager!.emitCollection(collection);
    await this.persistPayloads(collection.payloads);
    return this.sync({
      checkIntegrity: true,
      source: SyncSources.ResolveOutOfSync
    });
  }

  public async statelessDownloadAllItems(contentType?: ContentType, customEvent?: string) {
    const downloader = new AccountDownloader(
      this.apiService!,
      this.protocolService!,
      contentType,
      customEvent
    );

    const payloads = await downloader.run();
    return payloads.map((payload) => {
      return CreateItemFromPayload(payload);
    });
  }

  /** @unit_testing */
  // eslint-disable-next-line camelcase
  ut_setDatabaseLoaded(loaded: boolean) {
    this.databaseLoaded = loaded;
  }

  /** @unit_testing */
  // eslint-disable-next-line camelcase
  ut_clearLastSyncDate() {
    this.state!.lastSyncDate = undefined;
  }

  /** @unit_testing */
  // eslint-disable-next-line camelcase
  ut_beginLatencySimulator(latency: number) {
    this._simulate_latency = {
      latency: latency || 1000,
      enabled: true
    };
  }

  /** @unit_testing */
  // eslint-disable-next-line camelcase
  ut_endLatencySimulator() {
    this._simulate_latency = null;
  }
}

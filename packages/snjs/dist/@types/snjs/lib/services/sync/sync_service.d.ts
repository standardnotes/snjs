import { SNHistoryManager } from './../history/history_manager';
import { SyncEvent } from '../../../../services/sync/events';
import { ItemManager } from '../../../../services/item_manager';
import { SyncResponse } from '../../../../services/sync/response';
import { SNItem } from '../../../../models/core/item';
import { PurePayload } from '../../../../protocol/payloads/pure_payload';
import { PayloadManager } from './../payload_manager';
import { SNStorageService } from './../storage_service';
import { SNProtocolService } from './../protocol_service';
import { PureService } from '../../../../services/pure_service';
import { SyncOpStatus } from '../../../../services/sync/sync_op_status';
import { ContentType } from '../../../../models/content_types';
import { SNSessionManager } from '../api/session_manager';
import { SNApiService } from '../api/api_service';
export declare enum SyncQueueStrategy {
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
export declare enum SyncModes {
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
}
export declare enum SyncSources {
    External = 1,
    SpawnQueue = 2,
    ResolveQueue = 3,
    MoreDirtyItems = 4,
    AfterDownloadFirst = 5,
    IntegrityCheck = 6,
    ResolveOutOfSync = 7
}
export declare type SyncOptions = {
    queueStrategy?: SyncQueueStrategy;
    mode?: SyncModes;
    /** Whether the server should compute and return an integrity hash. */
    checkIntegrity?: boolean;
    /** Internally used to keep track of how sync requests were spawned. */
    source?: SyncSources;
    /** Whether to await any sync requests that may be queued from this call. */
    awaitAll?: boolean;
};
/**
 * The sync service orchestrates with the model manager, api service, and storage service
 * to ensure consistent state between the three. When a change is made to an item, consumers
 * call the sync service's sync function to first persist pending changes to local storage.
 * Then, the items are uploaded to the server. The sync service handles server responses,
 * including mapping any retrieved items to application state via model manager mapping.
 * After each sync request, any changes made or retrieved are also persisted locally.
 * The sync service largely does not perform any task unless it is called upon.
 */
export declare class SNSyncService extends PureService<SyncEvent, SyncResponse | {
    source: SyncSources;
}> {
    private itemManager;
    private sessionManager;
    private protocolService;
    private storageService;
    private payloadManager;
    private apiService;
    private historyService;
    private interval;
    private state?;
    private opStatus;
    private resolveQueue;
    private spawnQueue;
    completedOnlineDownloadFirstSync: boolean;
    private majorChangeThreshold;
    private maxDiscordance;
    private locked;
    private databaseLoaded;
    private syncToken?;
    private cursorToken?;
    private syncLock;
    private _simulate_latency?;
    private dealloced;
    lastSyncInvokationPromise?: Promise<unknown>;
    currentSyncRequestPromise?: Promise<void>;
    /** Content types appearing first are always mapped first */
    private readonly localLoadPriorty;
    constructor(itemManager: ItemManager, sessionManager: SNSessionManager, protocolService: SNProtocolService, storageService: SNStorageService, payloadManager: PayloadManager, apiService: SNApiService, historyService: SNHistoryManager, interval: any);
    /**
     * If the database has been newly created (because its new or was previously destroyed)
     * we want to reset any sync tokens we have.
     */
    onNewDatabaseCreated(): Promise<void>;
    deinit(): void;
    private initializeStatus;
    private initializeState;
    lockSyncing(): void;
    unlockSyncing(): void;
    isOutOfSync(): boolean;
    getLastSyncDate(): Date | undefined;
    getStatus(): SyncOpStatus;
    /**
     * Called by application when sign in or registration occurs.
     */
    resetSyncState(): void;
    isDatabaseLoaded(): boolean;
    /**
     * Used in tandem with `loadDatabasePayloads`
     */
    getDatabasePayloads(): Promise<unknown[]>;
    /**
     * @param rawPayloads - use `getDatabasePayloads` to get these payloads.
     * They are fed as a parameter so that callers don't have to await the loading, but can
     * await getting the raw payloads from storage
     */
    loadDatabasePayloads(rawPayloads: any[]): Promise<void>;
    private setLastSyncToken;
    private setPaginationToken;
    private getLastSyncToken;
    private getPaginationToken;
    private clearSyncPositionTokens;
    private itemsNeedingSync;
    private alternateUuidForItem;
    /**
     * Mark all items as dirty and needing sync, then persist to storage.
     */
    markAllItemsAsNeedingSync(): Promise<void>;
    /**
     * Return the payloads that need local persistence, before beginning a sync.
     * This way, if the application is closed before a sync request completes,
     * pending data will be saved to disk, and synced the next time the app opens.
     */
    private popPayloadsNeedingPreSyncSave;
    private queueStrategyResolveOnNext;
    private queueStrategyForceSpawnNew;
    /**
     * For timing strategy SyncQueueStrategy.ForceSpawnNew, we will execute a whole sync request
     * and pop it from the queue.
     */
    private popSpawnQueue;
    private payloadsByPreparingForServer;
    downloadFirstSync(waitTimeOnFailureMs: number, otherSyncOptions?: SyncOptions): Promise<void>;
    awaitCurrentSyncs(): Promise<void>;
    sync(options?: SyncOptions): Promise<unknown>;
    private performSync;
    /**
     * This is a temporary patch for users in mobile where for some reason the session+user
     * object go missing, and results in errorless sync in mistaken no account state.
     * Mobile will use protocolService.hasAccount(), which checks key state for account status,
     * to display a sign out button, whereas sync below will use sessionManager for account status,
     * which checks for existence of session object. These two states should be equivalent,
     * but if they're not, it means we're in an errored state.
     */
    private handleInvalidSessionState;
    private syncOnlineOperation;
    private syncOfflineOperation;
    private handleOfflineResponse;
    private handleErrorServerResponse;
    private handleSuccessServerResponse;
    /**
     * Items that have never been synced and marked as deleted should be cleared
     * as dirty, mapped, then removed from storage.
     */
    private handleNeverSyncedDeleted;
    /**
     * @param payloads The decrypted payloads to persist
     */
    persistPayloads(payloads: PurePayload[]): Promise<void>;
    private deletePayloads;
    /**
     * Computes a hash of all items updated_at strings joined with a comma.
     * The server will also do the same, to determine whether the client values match server values.
     * @returns A SHA256 digest string (hex).
     */
    private computeDataIntegrityHash;
    /**
     * Downloads all items and maps to lcoal items to attempt resolve out-of-sync state
     */
    resolveOutOfSync(): Promise<unknown>;
    statelessDownloadAllItems(contentType?: ContentType, customEvent?: string): Promise<SNItem[]>;
    /** @unit_testing */
    ut_setDatabaseLoaded(loaded: boolean): void;
    /** @unit_testing */
    ut_clearLastSyncDate(): void;
    /** @unit_testing */
    ut_beginLatencySimulator(latency: number): void;
    /** @unit_testing */
    ut_endLatencySimulator(): void;
}

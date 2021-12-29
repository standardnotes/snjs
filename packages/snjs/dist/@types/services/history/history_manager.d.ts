import { DeviceInterface } from '../../device_interface';
import { HistoryEntry } from './entries/history_entry';
import { UuidString } from './../../types';
import { RevisionListEntry } from './../api/responses';
import { SNStorageService } from '../storage_service';
import { ItemManager } from '../item_manager';
import { SNItem } from '../../models/core/item';
import { ContentType } from '../../models/content_types';
import { PureService } from '../pure_service';
import { SNApiService } from '../api/api_service';
import { SNProtocolService } from '../protocol_service';
import { HistoryMap } from './history_map';
/**
 * The history manager is responsible for:
 * 1. Transient session history, which include keeping track of changes made in the
 *    current application session. These change logs (unless otherwise configured) are
 *    ephemeral and do not persist past application restart. Session history entries are
 *    added via change observers that trigger when an item changes.
 * 2. Remote server history. Entries are automatically added by the server and must be
 *    retrieved per item via an API call.
 */
export declare class SNHistoryManager extends PureService {
    private itemManager;
    private storageService;
    private apiService;
    private protocolService;
    deviceInterface: DeviceInterface;
    private persistable;
    autoOptimize: boolean;
    private removeChangeObserver;
    private saveTimeout;
    /**
     * When no history exists for an item yet, we first put it in the staging map.
     * Then, the next time the item changes and it has no history, we check the staging map.
     * If the entry from the staging map differs from the incoming change, we now add the incoming
     * change to the history map and remove it from staging. This is a way to detect when the first
     * actual change of an item occurs (especially new items), rather than tracking a change
     * as an item propagating through the different PayloadSource
     * lifecycles (created, local saved, presyncsave, etc)
     */
    private historyStaging;
    private history;
    /** The content types for which to record history */
    readonly historyTypes: ContentType[];
    private itemRevisionThreshold;
    constructor(itemManager: ItemManager, storageService: SNStorageService, apiService: SNApiService, protocolService: SNProtocolService, deviceInterface: DeviceInterface);
    deinit(): void;
    /** For local session history */
    initializeFromDisk(): Promise<void>;
    private getPersistedHistory;
    private recordNewHistoryForItems;
    /** For local session history */
    isDiskEnabled(): boolean;
    /** For local session history */
    isAutoOptimizeEnabled(): boolean;
    cancelPendingPersist(): void;
    /** For local session history */
    saveToDisk(): void;
    private persistableHistoryValue;
    /** For local session history */
    setSessionItemRevisionThreshold(threshold: number): void;
    sessionHistoryForItem(item: SNItem): HistoryEntry[];
    /** For local session history */
    clearHistoryForItem(item: SNItem): void;
    /** For local session history */
    clearAllHistory(): Promise<void>;
    /** For local session history */
    toggleDiskSaving(): Promise<void>;
    /** For local session history */
    toggleAutoOptimize(): void;
    getHistoryMapCopy(): HistoryMap;
    /**
     * Fetches a list of revisions from the server for an item. These revisions do not
     * include the item's content. Instead, each revision's content must be fetched
     * individually upon selection via `fetchRemoteRevision`.
     */
    remoteHistoryForItem(item: SNItem): Promise<RevisionListEntry[] | undefined>;
    /**
     * Expands on a revision fetched via `remoteHistoryForItem` by getting a revision's
     * complete fields (including encrypted content).
     */
    fetchRemoteRevision(itemUuid: UuidString, entry: RevisionListEntry): Promise<HistoryEntry | undefined>;
    /**
     * Clean up if there are too many revisions. Note itemRevisionThreshold
     * is the amount of revisions which above, call for an optimization. An
     * optimization may not remove entries above this threshold. It will
     * determine what it should keep and what it shouldn't. So, it is possible
     * to have a threshold of 60 but have 600 entries, if the item history deems
     * those worth keeping.
     *
     * Rules:
     * - Keep an entry if it is the oldest entry
     * - Keep an entry if it is the latest entry
     * - Keep an entry if it is Significant
     * - If an entry is Significant and it is a deletion change, keep the entry before this entry.
     */
    optimizeHistoryForItem(uuid: string): void;
}

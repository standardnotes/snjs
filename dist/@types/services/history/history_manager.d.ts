import { ItemHistoryEntry } from './entries/item_history_entry';
import { SNStorageService } from '../storage_service';
import { ItemManager } from '../item_manager';
import { SNItem } from '../../models/core/item';
import { ContentType } from '../../models/content_types';
import { PureService } from '../pure_service';
import { SNApiService } from '../api/api_service';
import { SNProtocolService } from '../protocol_service';
declare type RemoteHistoryListEntry = {
    /** The uuid of the revision, not the item */
    uuid: string;
    content_type: ContentType;
    created_at: Date;
    updated_at: Date;
};
export declare type RemoteHistoryList = RemoteHistoryListEntry[];
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
    private itemManager?;
    private storageService?;
    private apiService;
    private protocolService;
    private contentTypes;
    private timeout;
    private sessionHistory?;
    private removeChangeObserver;
    private persistable;
    autoOptimize: boolean;
    private saveTimeout;
    constructor(itemManager: ItemManager, storageService: SNStorageService, apiService: SNApiService, protocolService: SNProtocolService, contentTypes: ContentType[], timeout: any);
    deinit(): void;
    /** For local session history */
    initializeFromDisk(): Promise<void>;
    addChangeObserver(): void;
    /** For local session history */
    isDiskEnabled(): boolean;
    /** For local session history */
    isAutoOptimizeEnabled(): boolean;
    /** For local session history */
    saveToDisk(): Promise<void>;
    /** For local session history */
    setSessionItemRevisionThreshold(threshold: number): void;
    addHistoryEntryForItem(item: SNItem): Promise<void>;
    sessionHistoryForItem(item: SNItem): import("./session/item_session_history").ItemSessionHistory;
    /** For local session history */
    clearHistoryForItem(item: SNItem): Promise<void>;
    /** For local session history */
    clearAllHistory(): Promise<void>;
    /** For local session history */
    toggleDiskSaving(): Promise<void>;
    /** For local session history */
    toggleAutoOptimize(): Promise<void>;
    /**
     * Fetches a list of revisions from the server for an item. These revisions do not
     * include the item's content. Instead, each revision's content must be fetched
     * individually upon selection via `fetchRemoteRevision`.
     */
    remoteHistoryForItem(item: SNItem): Promise<RemoteHistoryList | undefined>;
    /**
     * Expands on a revision fetched via `remoteHistoryForItem` by getting a revision's
     * complete fields (including encrypted content).
     */
    fetchRemoteRevision(itemUuid: string, revisionListEntry: RemoteHistoryListEntry): Promise<ItemHistoryEntry | undefined>;
}
export {};

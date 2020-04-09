import { ItemManager } from '../item_manager';
import { SNItem } from '../../models/core/item';
import { SNStorageService } from '../index';
import { ContentType } from '../../models/content_types';
import { PureService } from '../pure_service';
/**
 * The history manager is presently responsible for transient 'session history',
 * which include keeping track of changes made in the current application session.
 * These change logs (unless otherwise configured) are ephemeral and do not persist
 * past application restart.
 * In the future the history manager will also be responsible for remote server history.
 */
export declare class SNHistoryManager extends PureService {
    private itemManager?;
    private storageService?;
    private contentTypes;
    private timeout;
    private historySession?;
    private removeChangeObserver;
    private persistable;
    private autoOptimize;
    private saveTimeout;
    constructor(itemManager: ItemManager, storageService: SNStorageService, contentTypes: ContentType[], timeout: any);
    deinit(): void;
    initializeFromDisk(): Promise<void>;
    addChangeObserver(): void;
    isDiskEnabled(): boolean;
    isAutoOptimizeEnabled(): boolean;
    saveToDisk(): Promise<void>;
    setSessionItemRevisionThreshold(threshold: number): void;
    addHistoryEntryForItem(item: SNItem): Promise<void>;
    historyForItem(item: SNItem): import("./item_history").ItemHistory;
    clearHistoryForItem(item: SNItem): Promise<void>;
    clearAllHistory(): Promise<void>;
    toggleDiskSaving(): Promise<void>;
    toggleAutoOptimize(): Promise<void>;
}

import { SyncEventReceiver } from './events';
export declare class SyncOpStatus {
    private interval;
    private receiver;
    private inProgress;
    private completedUpload;
    private totalUpload;
    private downloaded;
    private databaseLoadCurrent;
    private databaseLoadTotal;
    private databaseLoadDone;
    private syncing;
    private syncStart;
    private syncEnd;
    private timingMonitor?;
    private error?;
    constructor(interval: any, receiver: SyncEventReceiver);
    deinit(): void;
    setSyncInProgress(): void;
    setUploadStatus(completed: number, total: number): void;
    setDownloadStatus(downloaded: number): void;
    setDatabaseLoadStatus(current: number, total: number, done: boolean): void;
    getStats(): {
        uploadCompletionCount: number;
        uploadTotalCount: number;
        downloadCount: number;
        localDataDone: boolean;
        localDataCurrent: number;
        localDataTotal: number;
    };
    setDidBegin(): void;
    setDidEnd(): void;
    get syncInProgress(): boolean;
    get secondsSinceSyncStart(): number;
    /**
     * Notifies receiver if current sync request is taking too long to complete.
     */
    startTimingMonitor(): void;
    stopTimingMonitor(): void;
    hasError(): boolean;
    setError(error: any): void;
    clearError(): void;
    reset(): void;
}

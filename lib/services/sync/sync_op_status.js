import { SyncEvents } from '@Lib';

const HEALTHY_SYNC_DURATION_THRESHOLD_S = 5;
const TIMING_MONITOR_POLL_FREQUENCY_MS = 500;

export class SyncOpStatus {
  constructor({ interval, receiver }) {
    this.interval = interval;
    this.receiver = receiver;
  }

  setSyncInProgress(inProgress) {
    this.inProgress = true;
  }

  /**
   * @access public
   * @param {Number} completed
   * @param {Number} total
   */
  setUploadStatus({ completed, total }) {
    this.completedUpload = completed;
    this.totalUpload = total;
    this.receiver(SyncEvents.StatusChanged);
  }

  /**
   * @access public
   * @param {Number} downloaded
   */
  setDownloadStatus({ downloaded }) {
    this.downloaded += downloaded;
    this.receiver(SyncEvents.StatusChanged);
  }

  setDatabaseLoadStatus({ current, total, done }) {
    this.databaseLoadCurrent = current;
    this.databaseLoadTotal = total;
    this.databaseLoadDone = done;
    if (done) {
      this.receiver(SyncEvents.LocalDataLoaded);
    } else {
      this.receiver(SyncEvents.LocalDataIncrementalLoad);
    }
  }

  /**
   * @access public
   */
  getStats() {
    return {
      uploadCompletionCount: this.completedUpload,
      uploadTotalCount: this.totalUpload,
      downloadCount: this.downloaded,
      localDataDone: this.databaseLoadDone,
      localDataCurrent: this.databaseLoadCurrent,
      localDataTotal: this.databaseLoadTotal
    };
  }

  setDidBegin() {
    this.syncing = true;
    this.syncStart = new Date();
  }

  setDidEnd() {
    this.syncing = false;
    this.syncEnd = new Date();
  }

  get syncInProgress() {
    return this.syncing === true;
  }

  get secondsSinceSyncStart() {
    return (new Date() - this.syncStart) / 1000;
  }

  /**
   * Notifies receiver if current sync request is taking too long to complete.
   */
  startTimingMonitor() {
    if (this.timingMonitor) {
      this.this.stopTimingMonitor();
    }
    this.timingMonitor = this.interval(() => {
      if (this.secondsSinceSyncStart > HEALTHY_SYNC_DURATION_THRESHOLD_S) {
        this.receiver(SyncEvents.SyncTakingTooLong);
        this.stopTimingMonitor();
      }
    }, TIMING_MONITOR_POLL_FREQUENCY_MS);
  }

  stopTimingMonitor() {
    if (Object.prototype.hasOwnProperty.call(this.interval, 'cancel')) {
      this.interval.cancel(this.timingMonitor);
    } else {
      clearInterval(this.timingMonitor);
    }
    this.timingMonitor = null;
  }

  hasError() {
    return !!this.error;
  }

  setError(error) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  reset() {
    this.downloaded = 0;
    this.completedUpload = 0;
    this.totalUpload = 0;
    this.inProgress = false;
    this.syncing = false;
    this.error = null;
    this.receiver(SyncEvents.StatusChanged);
  }
}

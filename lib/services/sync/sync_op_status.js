import { SYNC_EVENT_SYNC_TAKING_TOO_LONG } from '@Services/sync/events';

const HEALTHY_SYNC_DURATION_THRESHOLD_S     = 5;
const TIMING_MONITOR_POLL_FREQUENCY_MS    = 500;

export class SyncOpStatus {
  constructor({interval, receiver}) {
    this.interval = interval;
    this.receiver = receiver;
  }

  setSyncInProgress(inProgress) {
    this.inProgress = true;
  }

  setUploadStatus({completed, total}) {
    this.completedUpload = completed;
    this.totalUpload = total;
  }

  setDownloadStatus({downloaded}) {
    this.downloaded = downloaded;
  }

  setDidBegin() {
    this.syncing = true;
    this.syncStart = new Date();
  }

  setDidEnd() {
    this.syncing = false;
    this.syncEnd = new Date();
  }

  get secondsSinceSyncStart() {
    return (new Date() - this.syncStart) / 1000;
  }

  /**
   * Notifies receiver if current sync request is taking too long to complete.
   */
  startTimingMonitor() {
    if(this.timingMonitor) {
      this.this.stopTimingMonitor();
    }
    this.timingMonitor = this.interval(() => {
      if(this.secondsSinceSyncStart > HEALTHY_SYNC_DURATION_THRESHOLD_S) {
        this.receiver(SYNC_EVENT_SYNC_TAKING_TOO_LONG);
        this.stopTimingMonitor();
      }
    }, TIMING_MONITOR_POLL_FREQUENCY_MS)
  }

  stopTimingMonitor() {
    if(this.interval.hasOwnProperty('cancel')) {
      this.interval.cancel(this.timingMonitor);
    } else {
      clearInterval(this.timingMonitor);
    }
    this.timingMonitor = null;
  }

  setError(error) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }

  reset() {
    this.downloaded = 0;
    this.completedUpload = 0
    this.totalUpload = 0
    this.inProgress = false;
    this.syncing = false;
  }
}

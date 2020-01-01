export class SyncStatus {

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
  }


}

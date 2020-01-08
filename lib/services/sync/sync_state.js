import {
  SYNC_EVENT_EXIT_OUT_OF_SYNC,
  SYNC_EVENT_ENTER_OUT_OF_SYNC
} from '@Services/sync/events';

export class SyncState {

  constructor({receiver, maxDiscordance}) {
    this.syncDiscordance = 0;
    this.receiver = receiver;
    this.maxDiscordance = maxDiscordance;
    this.reset();
  }

  setLastPresaveSyncDate(date) {
    this.lastPreSyncSave = date;
  }

  isOutOfSync() {
    return this.outOfSync;
  }

  reset() {
    this.outOfSync = false;
  }

  get currentSyncDiscordance() {
    return this.syncDiscordance;
  }

  get needsSync() {
    return this.currentSyncDiscordance > 0
        && this.currentSyncDiscordance < this.maxDiscordance;
  }

  async setIntegrityHashes({clientHash, serverHash}) {
    const isInSync = (
      (!serverHash || serverHash.length === 0) ||
      !clientHash ||
      clientHash === serverHash
    )

    if(isInSync) {
      if(this.outOfSync) {
        this.outOfSync = false;
        this.receiver(SYNC_EVENT_EXIT_OUT_OF_SYNC);
      }
      this.syncDiscordance = 0;
    } else {
      this.syncDiscordance++;
      if(this.syncDiscordance >= this.maxDiscordance && !this.outOfSync) {
        this.outOfSync = true;
        this.receiver(SYNC_EVENT_ENTER_OUT_OF_SYNC);
      }
    }
  }

}

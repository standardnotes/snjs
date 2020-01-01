export class SyncState {

  constructor({receiver, maxDiscordance}) {
    this.receiver = receiver;
    this.maxDiscordance = maxDiscordance;
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

  setIntegrityHashes({clientHash, serverHash}) {
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
      this.receiver(SYNC_EVENT_SYNC_DISCORDANCE_CHANGE);
      if(this.syncDiscordance >= this.maxDiscordance && !this.outOfSync) {
        this.outOfSync = true;
        this.receiver(SYNC_EVENT_ENTER_OUT_OF_SYNC);
      }
    }
  }

}

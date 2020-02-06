import { SyncEvents } from '@Lib';

export class SyncState {

  constructor({receiver, maxDiscordance}) {
    this.discordance = 0;
    this.receiver = receiver;
    this.maxDiscordance = maxDiscordance;
    this.reset();
  }

  setLastPresaveSyncDate(date) {
    this._lastPreSyncSave = date;
  }

  get lastPreSyncSaveDate() {
    return this._lastPreSyncSave;
  }

  setLastSyncDate(date) {
    this._lastSyncDate = date;
  }

  get lastSyncDate() {
    return this._lastSyncDate;
  }

  isOutOfSync() {
    return this.outOfSync;
  }

  reset() {
    this.outOfSync = false;
  }
  
  get needsSync() {
    return this.discordance > 0
        && this.discordance < this.maxDiscordance;
  }

  getLastClientIntegrityHash() {
    return this.lastClientHash;
  }

  clearIntegrityHashes() {
    this.lastClientHash = null;
    this.lastServerHash = null;
  }

  async setIntegrityHashes({clientHash, serverHash}) {
    this.lastClientHash = clientHash;
    this.lastServerHash = serverHash;
    const isInSync = (
      (!serverHash || serverHash.length === 0) ||
      !clientHash ||
      clientHash === serverHash
    );

    if(isInSync) {
      if(this.outOfSync) {
        this.outOfSync = false;
        this.receiver(SyncEvents.ExitOutOfSync);
      }
      this.discordance = 0;
    } else {
      this.discordance++;
      if(this.discordance >= this.maxDiscordance && !this.outOfSync) {
        this.outOfSync = true;
        this.receiver(SyncEvents.EnterOutOfSync);
      }
    }
  }

}

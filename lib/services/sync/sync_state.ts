import { SyncEvents, SyncEventReceiver } from '@Lib/services/sync/events';

export class SyncState {

  public lastPreSyncSave?: Date
  public lastSyncDate?: Date

  private receiver: SyncEventReceiver
  private discordance = 0
  private maxDiscordance: number
  private outOfSync = false

  private lastClientHash?: string
  private lastServerHash?: string

  constructor(receiver: SyncEventReceiver, maxDiscordance: number) {
    this.receiver = receiver;
    this.maxDiscordance = maxDiscordance;
    this.reset();
  }

  isOutOfSync() {
    return this.outOfSync;
  }

  reset() {
    this.lastPreSyncSave = undefined;
    this.lastSyncDate = undefined;
    this.discordance = 0;
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
    this.lastClientHash = undefined;
    this.lastServerHash = undefined;
  }

  async setIntegrityHashes(clientHash: string, serverHash: string) {
    this.lastClientHash = clientHash;
    this.lastServerHash = serverHash;
    const isInSync = (
      (!serverHash || serverHash.length === 0) ||
      !clientHash ||
      clientHash === serverHash
    );

    if (isInSync) {
      if (this.outOfSync) {
        this.outOfSync = false;
        this.receiver(SyncEvents.ExitOutOfSync);
      }
      this.discordance = 0;
    } else {
      this.discordance++;
      if (this.discordance >= this.maxDiscordance && !this.outOfSync) {
        this.outOfSync = true;
        this.receiver(SyncEvents.EnterOutOfSync);
      }
    }
  }
}

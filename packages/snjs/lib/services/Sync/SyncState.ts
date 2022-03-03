import { SyncEvent, SyncEventReceiver } from '@standardnotes/services'

export class SyncState {
  public lastPreSyncSave?: Date
  public lastSyncDate?: Date

  private receiver: SyncEventReceiver
  private discordance = 0
  private maxDiscordance: number
  private outOfSync = false

  constructor(receiver: SyncEventReceiver, maxDiscordance: number) {
    this.receiver = receiver
    this.maxDiscordance = maxDiscordance
    this.reset()
  }

  isOutOfSync() {
    return this.outOfSync
  }

  reset() {
    this.lastPreSyncSave = undefined
    this.lastSyncDate = undefined
    this.discordance = 0
    this.outOfSync = false
  }

  get needsSync() {
    return this.discordance > 0 && this.discordance < this.maxDiscordance
  }

  setInSync(isInSync: boolean): void {
    if (isInSync) {
      if (this.outOfSync) {
        this.outOfSync = false
        this.receiver(SyncEvent.ExitOutOfSync)
      }
      this.discordance = 0
    } else {
      this.discordance++
      if (this.discordance >= this.maxDiscordance && !this.outOfSync) {
        this.outOfSync = true
        this.receiver(SyncEvent.EnterOutOfSync)
      }
    }
  }
}

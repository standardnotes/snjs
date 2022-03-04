import { SyncEvent, SyncEventReceiver } from '@standardnotes/services'

export class SyncState {
  public lastPreSyncSave?: Date
  public lastSyncDate?: Date

  private receiver: SyncEventReceiver
  private outOfSync = false

  constructor(receiver: SyncEventReceiver) {
    this.receiver = receiver
    this.reset()
  }

  isOutOfSync() {
    return this.outOfSync
  }

  reset() {
    this.lastPreSyncSave = undefined
    this.lastSyncDate = undefined
    this.outOfSync = false
  }

  setInSync(isInSync: boolean): void {
    if (isInSync === !this.outOfSync) {
      return
    }

    if (isInSync) {
      this.outOfSync = false
      this.receiver(SyncEvent.ExitOutOfSync)
    } else {
      this.outOfSync = true
      this.receiver(SyncEvent.EnterOutOfSync)
    }
  }
}

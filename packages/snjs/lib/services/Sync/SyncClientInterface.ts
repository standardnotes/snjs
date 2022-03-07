import { SyncOpStatus } from './SyncOpStatus'
import { SyncOptions } from './Types'

export interface SyncClientInterface {
  sync(options?: Partial<SyncOptions>): Promise<unknown>

  isOutOfSync(): boolean

  getLastSyncDate(): Date | undefined

  getSyncStatus(): SyncOpStatus
}

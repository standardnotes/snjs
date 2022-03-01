import { SyncResponse } from '@Lib/services/Sync/Response'

export enum SyncSignal {
  Response = 1,
  StatusChanged = 2,
}

export type SyncStats = {
  completedUploadCount: number
  totalUploadCount: number
}

export type ResponseSignalReceiver = (
  signal: SyncSignal,
  response?: SyncResponse,
  stats?: SyncStats,
) => Promise<void>

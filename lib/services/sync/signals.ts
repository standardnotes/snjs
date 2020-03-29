import { SyncResponse } from '@Services/sync/response';

export enum SyncSignal {
  Response = 1,
  StatusChanged = 2
}

export type ResponseSignalReceiver = (signal: SyncSignal, response?: SyncResponse, ) => Promise<void>
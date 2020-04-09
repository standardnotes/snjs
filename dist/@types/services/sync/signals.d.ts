import { SyncResponse } from './response';
export declare enum SyncSignal {
    Response = 1,
    StatusChanged = 2
}
export declare type ResponseSignalReceiver = (signal: SyncSignal, response?: SyncResponse) => Promise<void>;

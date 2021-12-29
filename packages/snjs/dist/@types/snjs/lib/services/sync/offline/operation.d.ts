import { PurePayload } from '../../../../../protocol/payloads/pure_payload';
import { ResponseSignalReceiver } from '../../../../../services/sync/signals';
export declare class OfflineSyncOperation {
    payloads: PurePayload[];
    receiver: ResponseSignalReceiver;
    /**
     * @param payloads  An array of payloads to sync offline
     * @param receiver  A function that receives callback multiple times during the operation
     */
    constructor(payloads: PurePayload[], receiver: ResponseSignalReceiver);
    run(): Promise<void>;
}

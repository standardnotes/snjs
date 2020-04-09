import { PurePayload } from '../../../protocol/payloads/pure_payload';
import { ResponseSignalReceiver } from '../signals';
import { SNApiService } from '../../api/api_service';
/**
 * A long running operation that handles multiple roundtrips from a server,
 * emitting a stream of values that should be acted upon in real time.
 */
export declare class AccountSyncOperation {
    private payloads;
    private receiver;
    private lastSyncToken;
    private paginationToken;
    checkIntegrity: boolean;
    private apiService;
    private pendingPayloads;
    private responses;
    /**
     * @param payloads   An array of payloads to send to the server
     * @param receiver   A function that receives callback multiple times during the operation
     */
    constructor(payloads: PurePayload[], receiver: ResponseSignalReceiver, lastSyncToken: string, paginationToken: string, checkIntegrity: boolean, apiService: SNApiService);
    /**
     * Read the payloads that have been saved, or are currently in flight.
     */
    get payloadsSavedOrSaving(): PurePayload[];
    popPayloads(count: number): PurePayload[];
    run(): Promise<void>;
    pendingUploadCount(): number;
    totalUploadCount(): number;
    get done(): boolean;
    get upLimit(): number;
    get downLimit(): number;
    get numberOfItemsInvolved(): number;
}

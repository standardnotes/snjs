import { RawSyncResponse } from '../api/responses';
import { PurePayload } from '../../protocol/payloads/pure_payload';
export declare class SyncResponse {
    readonly rawResponse: RawSyncResponse;
    readonly savedPayloads: PurePayload[];
    readonly retrievedPayloads: PurePayload[];
    readonly uuidConflictPayloads: PurePayload[];
    readonly dataConflictPayloads: PurePayload[];
    readonly rejectedPayloads: PurePayload[];
    readonly deletedPayloads: PurePayload[];
    constructor(rawResponse: RawSyncResponse);
    /**
     * Filter out and exclude any items that do not have a uuid. These are useless to us.
     */
    private filterRawItemArray;
    get error(): any;
    /**
     * Returns the HTTP status code for invalid requests
     */
    get status(): number;
    get lastSyncToken(): string | undefined;
    get paginationToken(): string | undefined;
    get integrityHash(): string | undefined;
    get checkIntegrity(): boolean | "" | undefined;
    get numberOfItemsInvolved(): number;
    get allProcessedPayloads(): PurePayload[];
    private get rawUuidConflictItems();
    private get rawDataConflictItems();
    private get rawRejectedPayloads();
    private get rawConflictObjects();
    get hasError(): boolean;
}

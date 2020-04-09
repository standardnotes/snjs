import { PurePayload } from '../../protocol/payloads/pure_payload';
import { ApiEndpointParam } from '../api/keys';
import { RawPayload } from '../../protocol/payloads/generator';
declare enum ConflictType {
    ConflictingData = "sync_conflict",
    UuidConflict = "uuid_conflict"
}
declare type ConflictParams = {
    type: ConflictType;
    server_item?: RawPayload;
    unsaved_item?: RawPayload;
    /** @legacay */
    item?: RawPayload;
};
declare type RawSyncResponse = {
    error?: any;
    [ApiEndpointParam.LastSyncToken]?: string;
    [ApiEndpointParam.PaginationToken]?: string;
    [ApiEndpointParam.IntegrityResult]?: string;
    retrieved_items?: RawPayload[];
    saved_items?: RawPayload[];
    conflicts?: ConflictParams[];
    unsaved?: ConflictParams[];
    status?: number;
};
export declare class SyncResponse {
    readonly rawResponse: RawSyncResponse;
    readonly savedPayloads: PurePayload[];
    readonly retrievedPayloads: PurePayload[];
    readonly uuidConflictPayloads: PurePayload[];
    readonly dataConflictPayloads: PurePayload[];
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
    private get rawConflictObjects();
    get hasError(): boolean;
}
export {};

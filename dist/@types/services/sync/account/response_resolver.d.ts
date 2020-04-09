import { PurePayload } from '../../../protocol/payloads/pure_payload';
import { SyncResponse } from '../response';
import { ImmutablePayloadCollection } from '../../../protocol/payloads/collection';
/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export declare class SyncResponseResolver {
    private response;
    private baseCollection;
    private relatedCollectionSet;
    constructor(response: SyncResponse, decryptedResponsePayloads: PurePayload[], baseCollection: ImmutablePayloadCollection, payloadsSavedOrSaving: PurePayload[]);
    collectionsByProcessingResponse(): Promise<ImmutablePayloadCollection[]>;
    private collectionByProcessingPayloads;
    private finalDirtyStateForPayload;
}

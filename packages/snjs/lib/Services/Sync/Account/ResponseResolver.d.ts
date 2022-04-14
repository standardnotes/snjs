import { ImmutablePayloadCollection, HistoryMap, FullyFormedPayloadInterface, ServerSyncPushContextualPayload, ServerSyncSavedContextualPayload, PayloadEmitSource } from '@standardnotes/models';
export declare type DeltaEmit = {
    changed: FullyFormedPayloadInterface[];
    ignored?: FullyFormedPayloadInterface[];
    source: PayloadEmitSource;
};
declare type PayloadSet = {
    retrievedPayloads: FullyFormedPayloadInterface[];
    savedPayloads: ServerSyncSavedContextualPayload[];
    uuidConflictPayloads: FullyFormedPayloadInterface[];
    dataConflictPayloads: FullyFormedPayloadInterface[];
    rejectedPayloads: FullyFormedPayloadInterface[];
};
/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
export declare class ServerSyncResponseResolver {
    private payloadSet;
    private baseCollection;
    private payloadsSavedOrSaving;
    private historyMap;
    constructor(payloadSet: PayloadSet, baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>, payloadsSavedOrSaving: ServerSyncPushContextualPayload[], historyMap: HistoryMap);
    collectionsByProcessingResponse(): Promise<DeltaEmit[]>;
    private processSavedPayloads;
    private processRetrievedPayloads;
    private processDataConflictPayloads;
    private processUuidConflictPayloads;
    private processRejectedPayloads;
}
export {};

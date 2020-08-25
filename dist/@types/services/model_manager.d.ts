import { PayloadSource } from './../protocol/payloads/sources';
import { ContentType } from './../models/content_types';
import { UuidString } from './../types';
import { PurePayload } from '../protocol/payloads/pure_payload';
import { PureService } from './pure_service';
import { MutableCollection } from '../protocol/collection/collection';
import { ImmutablePayloadCollection } from '../protocol/collection/payload_collection';
declare type ChangeCallback = (changed: PurePayload[], inserted: PurePayload[], discarded: PurePayload[], source?: PayloadSource, sourceKey?: string) => void;
/**
 * The model manager is responsible for keeping state regarding what items exist in the
 * global application state. It does so by exposing functions that allow consumers to 'map'
 * a detached payload into global application state. Whenever a change is made or retrieved
 * from any source, it must be mapped in order to be properly reflected in global application state.
 * The model manager deals only with in-memory state, and does not deal directly with storage.
 * It also serves as a query store, and can be queried for current notes, tags, etc.
 * It exposes methods that allow consumers to listen to mapping events. This is how
 * applications 'stream' items to display in the interface.
 */
export declare class PayloadManager extends PureService {
    private changeObservers;
    collection: MutableCollection<PurePayload>;
    private emitQueue;
    constructor();
    /**
     * Our payload collection keeps the latest mapped payload for every payload
     * that passes through our mapping function. Use this to query current state
     * as needed to make decisions, like about duplication or uuid alteration.
     */
    getMasterCollection(): ImmutablePayloadCollection;
    deinit(): void;
    resetState(): void;
    find(uuids: UuidString[]): (PurePayload | undefined)[];
    /**
     * One of many mapping helpers available.
     * This function maps a collection of payloads.
     */
    emitCollection(collection: ImmutablePayloadCollection, sourceKey?: string): Promise<PurePayload[]>;
    /**
     * One of many mapping helpers available.
     * This function maps a payload to an item
     * @returns every paylod altered as a result of this operation, to be
     * saved to storage by the caller
     */
    emitPayload(payload: PurePayload, source: PayloadSource, sourceKey?: string): Promise<PurePayload[]>;
    /**
     * This function maps multiple payloads to items, and is the authoratative mapping
     * function that all other mapping helpers rely on
     * @returns every paylod altered as a result of this operation, to be
     * saved to storage by the caller
     */
    emitPayloads(payloads: PurePayload[], source: PayloadSource, sourceKey?: string): Promise<PurePayload[]>;
    private popQueue;
    private mergePayloadsOntoMaster;
    /**
     * Notifies observers when an item has been mapped.
     * @param types - An array of content types to listen for
     * @param priority - The lower the priority, the earlier the function is called
     *  wrt to other observers
     */
    addObserver(types: ContentType | ContentType[], callback: ChangeCallback, priority?: number): () => void;
    /**
     * This function is mostly for internal use, but can be used externally by consumers who
     * explicitely understand what they are doing (want to propagate model state without mapping)
     */
    notifyChangeObservers(changed: PurePayload[], inserted: PurePayload[], discarded: PurePayload[], source: PayloadSource, sourceKey?: string): void;
    /**
     * Imports an array of payloads from an external source (such as a backup file)
     * and marks the items as dirty.
     * @returns Resulting items
     */
    importPayloads(payloads: PurePayload[]): Promise<string[]>;
    removePayloadLocally(payload: PurePayload): void;
}
export {};

import { PayloadSource } from '../../../../protocol/payloads/sources';
import { ImmutablePayloadCollection } from '../../../../protocol/collection/payload_collection';
export declare class ImmutablePayloadCollectionSet {
    readonly collections: Array<ImmutablePayloadCollection>;
    /**
     * @param collections An array of ImmutablePayloadCollection objects.
     */
    constructor(collections: Array<ImmutablePayloadCollection>);
    collectionForSource(source: PayloadSource): ImmutablePayloadCollection | undefined;
}

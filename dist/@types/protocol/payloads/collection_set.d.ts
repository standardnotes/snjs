import { PayloadSource } from './sources';
import { ImmutablePayloadCollection } from './collection';
export declare class ImmutablePayloadCollectionSet {
    readonly collections: Array<ImmutablePayloadCollection>;
    /**
     * @param collections An array of ImmutablePayloadCollection objects.
     */
    constructor(collections: Array<ImmutablePayloadCollection>);
    collectionForSource(source: PayloadSource): ImmutablePayloadCollection | undefined;
}

import { PayloadSource } from '@Payloads/sources';
import { ImmutablePayloadCollection } from '@Payloads/collection';

export class ImmutablePayloadCollectionSet {
  readonly collections: Array<ImmutablePayloadCollection>

  /**
   * @param collections An array of ImmutablePayloadCollection objects.
   */
  constructor(collections: Array<ImmutablePayloadCollection>) {
    this.collections = collections;
    Object.freeze(this);
  }

  collectionForSource(source: PayloadSource) {
    return this.collections.find(collection => {
      return collection.source === source;
    });
  }
}

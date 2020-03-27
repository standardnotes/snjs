import { PayloadSources } from '@Payloads/sources';
import { PayloadCollection } from '@Payloads/collection';

export class PayloadCollectionSet {
  readonly collections: Array<PayloadCollection>

  /**
   * @param collections An array of PayloadCollection objects.
   */
  constructor(collections: Array<PayloadCollection>) {
    this.collections = collections;
    Object.freeze(this);
  }

  collectionForSource(source: PayloadSources) {
    return this.collections.find(collection => {
      return collection.source === source;
    });
  }
}

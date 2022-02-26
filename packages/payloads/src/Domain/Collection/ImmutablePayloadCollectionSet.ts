import { PayloadSource } from '../Payload/PayloadSource'
import { ImmutablePayloadCollection } from './ImmutablePayloadCollection'

export class ImmutablePayloadCollectionSet {
  readonly collections: Array<ImmutablePayloadCollection>;

  /**
   * @param collections An array of ImmutablePayloadCollection objects.
   */
  constructor(collections: Array<ImmutablePayloadCollection>) {
    this.collections = collections
    Object.freeze(this)
  }

  collectionForSource(source: PayloadSource): ImmutablePayloadCollection | undefined {
    return this.collections.find((collection) => {
      return collection.source === source
    })
  }
}
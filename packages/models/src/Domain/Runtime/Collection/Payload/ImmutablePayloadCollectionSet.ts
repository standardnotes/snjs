import { PayloadInterface } from '../../../Abstract/Payload'
import { PayloadSource } from '../../../Abstract/Payload/Types/PayloadSource'
import { ImmutablePayloadCollection } from './ImmutablePayloadCollection'

export class ImmutablePayloadCollectionSet<P extends PayloadInterface = PayloadInterface> {
  readonly collections: Array<ImmutablePayloadCollection<P>>

  /**
   * @param collections An array of ImmutablePayloadCollection objects.
   */
  constructor(collections: Array<ImmutablePayloadCollection<P>>) {
    this.collections = collections
    Object.freeze(this)
  }

  collectionForSource(source: PayloadSource): ImmutablePayloadCollection<P> | undefined {
    return this.collections.find((collection) => {
      return collection.source === source
    })
  }
}

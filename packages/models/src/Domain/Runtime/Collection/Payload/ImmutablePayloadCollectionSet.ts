import { FullyFormedPayloadInterface } from './../../../Abstract/Payload/Interfaces/UnionTypes'
import { PayloadSource } from '../../../Abstract/Payload/Types/PayloadSource'
import { ImmutablePayloadCollection } from './ImmutablePayloadCollection'

export class ImmutablePayloadCollectionSet<
  P extends FullyFormedPayloadInterface = FullyFormedPayloadInterface,
> {
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

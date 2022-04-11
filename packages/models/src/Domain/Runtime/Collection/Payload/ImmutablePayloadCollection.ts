import { FullyFormedPayloadInterface } from './../../../Abstract/Payload/Interfaces/UnionTypes'
import { ContentType } from '@standardnotes/common'
import { UuidMap } from '@standardnotes/utils'
import { PayloadSource } from '../../../Abstract/Payload/Types/PayloadSource'
import { PayloadCollection } from './PayloadCollection'

/**
 * A collection of payloads coming from a single source.
 */
export class ImmutablePayloadCollection<
  P extends FullyFormedPayloadInterface,
> extends PayloadCollection<P> {
  public source?: PayloadSource

  public get payloads(): P[] {
    return this.all()
  }

  /** We don't use a constructor for this because we don't want the constructor to have
   * side-effects, such as calling collection.set(). */
  static WithPayloads<T extends FullyFormedPayloadInterface>(
    payloads: T[] = [],
    source?: PayloadSource,
  ): ImmutablePayloadCollection<T> {
    const collection = new ImmutablePayloadCollection<T>()
    collection.source = source
    if (payloads.length > 0) {
      collection.set(payloads)
    }

    Object.freeze(collection)
    return collection
  }

  static FromCollection<T extends FullyFormedPayloadInterface>(
    collection: PayloadCollection<T>,
  ): ImmutablePayloadCollection<T> {
    const mapCopy = Object.freeze(Object.assign({}, collection.map))
    const typedMapCopy = Object.freeze(Object.assign({}, collection.typedMap))
    const referenceMapCopy = Object.freeze(collection.referenceMap.makeCopy()) as UuidMap
    const conflictMapCopy = Object.freeze(collection.conflictMap.makeCopy()) as UuidMap

    const result = new ImmutablePayloadCollection<T>(
      true,
      mapCopy,
      typedMapCopy as Partial<Record<ContentType, T[]>>,
      referenceMapCopy,
      conflictMapCopy,
    )

    Object.freeze(result)

    return result
  }

  mutableCopy(): PayloadCollection<P> {
    const mapCopy = Object.assign({}, this.map)
    const typedMapCopy = Object.assign({}, this.typedMap)
    const referenceMapCopy = this.referenceMap.makeCopy()
    const conflictMapCopy = this.conflictMap.makeCopy()
    const result = new PayloadCollection(
      true,
      mapCopy,
      typedMapCopy,
      referenceMapCopy,
      conflictMapCopy,
    )
    return result
  }
}

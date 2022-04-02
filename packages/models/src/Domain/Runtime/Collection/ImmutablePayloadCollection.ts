import { ContentType, Uuid } from '@standardnotes/common'
import { UuidMap } from '@standardnotes/utils'
import { PayloadInterface } from '../../Abstract/Payload/Interfaces/PayloadInterface'
import { PayloadSource } from '../../Abstract/Payload/Types/PayloadSource'
import { PurePayload } from '../../Abstract/Payload/Implementations/PurePayload'
import { MutableCollection } from './MutableCollection'

/**
 * A collection of payloads coming from a single source.
 */
export class ImmutablePayloadCollection extends MutableCollection<PayloadInterface> {
  public source?: PayloadSource

  /** We don't use a constructor for this because we don't want the constructor to have
   * side-effects, such as calling collection.set(). */
  static WithPayloads(
    payloads: PurePayload[] = [],
    source?: PayloadSource,
  ): ImmutablePayloadCollection {
    const collection = new ImmutablePayloadCollection()
    collection.source = source
    if (payloads.length > 0) {
      collection.set(payloads)
    }
    Object.freeze(collection)
    return collection
  }

  static FromCollection(collection: MutableCollection<PurePayload>): ImmutablePayloadCollection {
    const mapCopy = Object.freeze(Object.assign({}, collection.map))
    const typedMapCopy = Object.freeze(Object.assign({}, collection.typedMap))
    const referenceMapCopy = Object.freeze(collection.referenceMap.makeCopy()) as UuidMap
    const conflictMapCopy = Object.freeze(collection.conflictMap.makeCopy()) as UuidMap
    const result = new ImmutablePayloadCollection(
      true,
      mapCopy as Partial<Record<Uuid, PurePayload>>,
      typedMapCopy as Partial<Record<ContentType, PurePayload[]>>,
      referenceMapCopy,
      conflictMapCopy,
    )
    Object.freeze(result)
    return result
  }

  mutableCopy(): MutableCollection<PurePayload> {
    const mapCopy = Object.assign({}, this.map)
    const typedMapCopy = Object.assign({}, this.typedMap)
    const referenceMapCopy = this.referenceMap.makeCopy() as UuidMap
    const conflictMapCopy = this.conflictMap.makeCopy() as UuidMap
    const result = new MutableCollection(
      true,
      mapCopy as Partial<Record<Uuid, PurePayload>>,
      typedMapCopy as Partial<Record<ContentType, PurePayload[]>>,
      referenceMapCopy,
      conflictMapCopy,
    )
    return result
  }

  public get payloads(): PurePayload[] {
    return this.all()
  }
}

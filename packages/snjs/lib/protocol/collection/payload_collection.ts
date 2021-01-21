import { PayloadSource } from '@Payloads/sources';
import { ContentType } from '@Models/content_types';
import { UuidString } from './../../types';
import { PurePayload } from '@Payloads/pure_payload';
import { MutableCollection } from './collection';
import { UuidMap } from './uuid_map';
/**
 * A collection of payloads coming from a single source.
 */
export class ImmutablePayloadCollection extends MutableCollection<PurePayload> {
  public source?: PayloadSource;

  /** We don't use a constructor for this because we don't want the constructor to have
   * side-effects, such as calling collection.set(). */
  static WithPayloads(payloads: PurePayload[] = [], source?: PayloadSource) {
    const collection = new ImmutablePayloadCollection();
    collection.source = source;
    if(payloads.length > 0) {
      collection.set(payloads);
    }
    Object.freeze(collection);
    return collection;
  }

  static FromCollection(collection: MutableCollection<PurePayload>) {
    const mapCopy = Object.freeze(Object.assign({}, collection.map));
    const typedMapCopy = Object.freeze(Object.assign({}, collection.typedMap));
    const referenceMapCopy = Object.freeze(collection.referenceMap.makeCopy()) as UuidMap;
    const conflictMapCopy = Object.freeze(collection.conflictMap.makeCopy()) as UuidMap;
    const result = new ImmutablePayloadCollection(
      true,
      mapCopy as Partial<Record<UuidString, PurePayload>>,
      typedMapCopy as Partial<Record<ContentType, PurePayload[]>>,
      referenceMapCopy,
      conflictMapCopy
    );
    Object.freeze(result);
    return result;
  }

  public get payloads() {
    return this.all();
  }
}

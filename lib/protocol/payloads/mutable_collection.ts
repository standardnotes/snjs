import { isString, removeFromArray } from '@Lib/utils';
import { SNItem } from './../../models/core/item';
import remove from 'lodash/remove';
import { ContentType } from '@Models/content_types';
import { PayloadCollection } from '@Payloads/collection';
import { UuidString } from './../../types';
import { PurePayload } from '@Payloads/pure_payload';

type Payloadable = PurePayload | SNItem

export class MutableCollection<T extends Payloadable> {

  private readonly map: Partial<Record<UuidString, T>> = {}
  private readonly typedMap: Partial<Record<ContentType, T[]>> = {}

  /** Maintains an index for each item id where the value is an array of item ids that the 
 * item references. This is essentially equivalent to item.content.references, 
 * but keeps state even when the item is deleted. So if tag A references Note B, 
 * referenceMap[A.uuid] == [B.uuid]. */
  private referenceMap: Partial<Record<UuidString, UuidString[]>> = {}
  /** Maintains an index for each item id where the value is an array of item ids where 
   * the items reference the key item. So if tag A references Note B, 
   * inverseReferenceMap[B.uuid] == [A.uuid]. This allows callers to determine for a given item,
   * who references it? It would be prohibitive to look this up on demand */
  private inverseReferenceMap: Partial<Record<UuidString, UuidString[]>> = {}

  constructor(elements: T[] = []) {
    for (const element of elements) {
      this.map[element.uuid!] = element;
      this.setToTypedMap(element);
    }
  }

  public all(contentType?: ContentType) {
    if (contentType) {
      return this.typedMap[contentType] || [];
    } else {
      return Object.keys(this.map).map((uuid: UuidString) => {
        return this.map[uuid]!;
      }) as T[];
    }
  }

  public find(uuid: UuidString) {
    return this.map[uuid];
  }

  /**
   * @param includeBlanks If true and an item is not found, an `undefined` element
   * will be inserted into the array.
   */
  public findAll(uuids: UuidString[], includeBlanks = false) {
    const results = [];
    for (const id of uuids) {
      const element = this.map[id];
      if (element || includeBlanks) {
        results.push(element);
      }
    }
    return results;
  }

  public set(elements: T | T[]) {
    elements = Array.isArray(elements) ? elements : [elements];
    for (const element of elements) {
      this.map[element.uuid!] = element;
      this.setToTypedMap(element);
      if (element.deleted) {
        this.deestablishReferenceIndexForDeletedItem(element.uuid!);
      } else {
        this.updateReferenceIndex(element.uuid!);
      }
    }
  }

  public discard(elements: T | T[]) {
    elements = Array.isArray(elements) ? elements : [elements];
    for (const element of elements) {
      this.deestablishReferenceIndexForDeletedItem(element.uuid!);
      this.deleteFromTypedMap(element);
      delete this.map[element.uuid!];
    }
  }

  public toImmutablePayloadCollection() {
    return new PayloadCollection(this.all() as PurePayload[]);
  }

  private setToTypedMap(element: T) {
    const array = this.typedMap[element.content_type!] || [] as T[];
    remove(array, { uuid: element.uuid! as any });
    array.push(element);
    this.typedMap[element.content_type!] = array;
  }

  private deleteFromTypedMap(element: T) {
    const array = this.typedMap[element.content_type!] || [] as T[];
    remove(array, { uuid: element.uuid! as any });
    this.typedMap[element.content_type!] = array;
  }

  public uuidsThatReferenceUuid(uuid: UuidString) {
    if (!isString(uuid)) {
      throw Error('Must use uuid string');
    }
    return this.inverseReferenceMap[uuid] || [];
  }

  private updateReferenceIndex(uuid: UuidString) {
    if (!isString(uuid)) {
      throw Error('Must use uuid');
    }
    const object = this.find(uuid)!;
    const previousDirect = this.referenceMap[uuid] || [];
    /** Direct index */
    this.referenceMap[uuid] = object.references.map((r) => r.uuid);

    /** Inverse index */
    /** First remove any old values in case references have changed */
    for (const previousDirectReference of previousDirect) {
      const inverseIndex = this.inverseReferenceMap[previousDirectReference];
      if (inverseIndex) {
        removeFromArray(inverseIndex, uuid);
      }
    }

    /** Now map current references */
    for (const reference of object.references) {
      const inverseIndex = this.inverseReferenceMap[reference.uuid] || [];
      inverseIndex.push(uuid);
      this.inverseReferenceMap[reference.uuid] = inverseIndex;
    }
  }

  private deestablishReferenceIndexForDeletedItem(uuid: UuidString) {
    /** Items that we reference */
    const directReferences = this.referenceMap[uuid] || []
    for (const directReference of directReferences) {
      removeFromArray(
        this.inverseReferenceMap[directReference] || [],
        uuid
      );
    }
    delete this.referenceMap[uuid];

    /** Items that are referencing us */
    const inverseReferences = this.inverseReferenceMap[uuid] || []
    for (const inverseReference of inverseReferences) {
      removeFromArray(
        this.referenceMap[inverseReference] || [],
        uuid
      );
    }
    delete this.inverseReferenceMap[uuid];
  }


}

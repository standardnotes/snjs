import { PayloadSource } from '@Payloads/sources';
import { UuidMap } from './uuid_map';
import { isString, extendArray } from '@Lib/utils';
import { SNItem } from './../../models/core/item';
import remove from 'lodash/remove';
import { ContentType } from '@Models/content_types';
import { UuidString } from './../../types';
import { PurePayload } from '@Payloads/pure_payload';

type Payloadable = PurePayload | SNItem

export class MutableCollection<T extends Payloadable> {

  protected readonly map: Partial<Record<UuidString, T>> = {}
  protected readonly typedMap: Partial<Record<ContentType, T[]>> = {} = {}
  
  /** An array of uuids of items that are dirty */
  protected dirtyIndex: Set<UuidString> = new Set();

  /** An array of uuids of items that are errorDecrypting or waitingForKey */
  protected invalidsIndex: Set<UuidString> = new Set();

  /** An array of uuids of items that are not marked as deleted */
  protected nondeletedIndex: Set<UuidString> = new Set();

  /** Maintains an index where the direct map for each item id is an array 
   * of item ids that the item references. This is essentially equivalent to 
   * item.content.references, but keeps state even when the item is deleted. 
   * So if tag A references Note B, referenceMap.directMap[A.uuid] == [B.uuid]. 
   * The inverse map for each item is an array of item ids where the items reference the 
   * key item. So if tag A references Note B, referenceMap.inverseMap[B.uuid] == [A.uuid]. 
   * This allows callers to determine for a given item, who references it? 
   * It would be prohibitive to look this up on demand */
  protected readonly referenceMap: UuidMap
  /** Maintains an index for each item uuid where the value is an array of uuids that are
   * conflicts of that item. So if Note B and C are conflicts of Note A, 
   * conflictMap[A.uuid] == [B.uuid, C.uuid] */
  protected readonly conflictMap: UuidMap

  constructor(
    elements: T[] = [],
    copy = false,
    mapCopy?: Partial<Record<UuidString, T>>,
    typedMapCopy?: Partial<Record<ContentType, T[]>>,
    referenceMapCopy?: UuidMap,
    conflictMapCopy?: UuidMap
  ) {
    if (copy) {
      this.map = mapCopy!;
      this.typedMap = typedMapCopy!;
      this.referenceMap = referenceMapCopy!;
      this.conflictMap = conflictMapCopy!;
    } else {
      this.referenceMap = new UuidMap();
      this.conflictMap = new UuidMap();
      this.set(elements);
    }
  }

  immutablePayloadCopy() {
    const mapCopy = Object.freeze(Object.assign({}, this.map));
    const typedMapCopy = Object.freeze(Object.assign({}, this.typedMap));
    const referenceMapCopy = Object.freeze(this.referenceMap.makeCopy()) as UuidMap;
    const conflictMapCopy = Object.freeze(this.conflictMap.makeCopy()) as UuidMap;
    return new ImmutablePayloadCollection(
      undefined,
      undefined,
      true,
      mapCopy as Partial<Record<UuidString, PurePayload>>,
      typedMapCopy as Partial<Record<ContentType, PurePayload[]>>,
      referenceMapCopy,
      conflictMapCopy
    )
  }

  public uuids() {
    return Object.keys(this.map);
  }

  public all(contentType?: ContentType | ContentType[]) {
    if (contentType) {
      if(Array.isArray(contentType)) {
        const elements = [] as T[];
        for(const type of contentType) {
          extendArray(elements, this.typedMap[type] || []);
        }
        return elements;
      } else {
        return this.typedMap[contentType] || [];
      }
    } else {
      return Object.keys(this.map).map((uuid: UuidString) => {
        return this.map[uuid]!;
      }) as T[];
    }
  }

  public find(uuid: UuidString) {
    return this.map[uuid];
  }

  /** Returns all elements that are marked as dirty */
  public dirtyElements() {
    const uuids = Array.from(this.dirtyIndex);
    return this.findAll(uuids) as T[];
  }

  /** Returns all elements that are errorDecrypting or waitingForKey */
  public invalidElements() {
    const uuids = Array.from(this.invalidsIndex);
    return this.findAll(uuids) as T[];
  }

  /** Returns all elements that are not marked as deleted */
  public nondeletedElements() {
    const uuids = Array.from(this.nondeletedIndex);
    return this.findAll(uuids) as T[];
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
      
      /** Dirty index */
      if(element.dirty) {
        this.dirtyIndex.add(element.uuid);
      } else {
        this.dirtyIndex.delete(element.uuid);
      }
      
      /** Invalids index */
      if(element.errorDecrypting || element.waitingForKey) {
        this.invalidsIndex.add(element.uuid);
      } else {
        this.invalidsIndex.delete(element.uuid);
      }

      if (element.deleted) {
        this.referenceMap.removeFromMap(element.uuid!);
        this.nondeletedIndex.delete(element.uuid);
      } else {
        this.nondeletedIndex.add(element.uuid);
        const conflictOf = element.safeContent.conflict_of;
        if (conflictOf) {
          this.conflictMap.establishRelationship(conflictOf, element.uuid);
        }
        this.referenceMap.setAllRelationships(
          element.uuid!,
          element.references.map((r) => r.uuid)
        );
      }
    }
  }

  public discard(elements: T | T[]) {
    elements = Array.isArray(elements) ? elements : [elements];
    for (const element of elements) {
      this.conflictMap.removeFromMap(element.uuid);
      this.referenceMap.removeFromMap(element.uuid);
      this.deleteFromTypedMap(element);
      delete this.map[element.uuid!];
    }
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
    return this.referenceMap.getInverseRelationships(uuid);
  }

  public elementsReferencingElement(element: T) {
    const uuids = this.uuidsThatReferenceUuid(element.uuid);
    return this.findAll(uuids) as T[];
  }

  public conflictsOf(uuid: UuidString) {
    const uuids = this.conflictMap.getDirectRelationships(uuid);
    return this.findAll(uuids) as T[];
  }
}

/**
 * A collection of payloads coming from a single source.
 */
export class ImmutablePayloadCollection extends MutableCollection<PurePayload> {
  public readonly source?: PayloadSource

  constructor(
    payloads: PurePayload[] = [],
    source?: PayloadSource,
    copy = false,
    mapCopy?: Partial<Record<UuidString, PurePayload>>,
    typedMapCopy?: Partial<Record<ContentType, PurePayload[]>>,
    referenceMapCopy?: UuidMap,
    conflictMapCopy?: UuidMap
  ) {
    super(
      payloads,
      copy,
      mapCopy,
      typedMapCopy,
      referenceMapCopy,
      conflictMapCopy
    );
    this.source = source;
    Object.freeze(this);
  }

  public get payloads() {
    return this.all();
  }
}

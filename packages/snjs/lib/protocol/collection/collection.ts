import { UuidMap } from './uuid_map';
import { extendArray, isString } from '@Lib/utils';
import { SNItem } from './../../models/core/item';
import remove from 'lodash/remove';
import { ContentType } from '@Models/content_types';
import { UuidString } from './../../types';
import { PurePayload } from '@Payloads/pure_payload';

export class MutableCollection<T extends PurePayload | SNItem> {
  readonly map: Partial<Record<UuidString, T>> = {};
  readonly typedMap: Partial<Record<ContentType, T[]>> = {};

  /** An array of uuids of items that are dirty */
  dirtyIndex: Set<UuidString> = new Set();

  /** An array of uuids of items that are errorDecrypting or waitingForKey */
  invalidsIndex: Set<UuidString> = new Set();

  /** An array of uuids of items that are not marked as deleted */
  nondeletedIndex: Set<UuidString> = new Set();

  /** Maintains an index where the direct map for each item id is an array
   * of item ids that the item references. This is essentially equivalent to
   * item.content.references, but keeps state even when the item is deleted.
   * So if tag A references Note B, referenceMap.directMap[A.uuid] == [B.uuid].
   * The inverse map for each item is an array of item ids where the items reference the
   * key item. So if tag A references Note B, referenceMap.inverseMap[B.uuid] == [A.uuid].
   * This allows callers to determine for a given item, who references it?
   * It would be prohibitive to look this up on demand */
  readonly referenceMap: UuidMap;
  /** Maintains an index for each item uuid where the value is an array of uuids that are
   * conflicts of that item. So if Note B and C are conflicts of Note A,
   * conflictMap[A.uuid] == [B.uuid, C.uuid] */
  readonly conflictMap: UuidMap;

  constructor(
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
    }
  }

  public uuids() {
    return Object.keys(this.map);
  }

  public all(contentType?: ContentType | ContentType[]) {
    if (contentType) {
      if (Array.isArray(contentType)) {
        const elements = [] as T[];
        for (const type of contentType) {
          extendArray(elements, this.typedMap[type] || []);
        }
        return elements;
      } else {
        return this.typedMap[contentType]?.slice() || [];
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
  public findAll(uuids: UuidString[], includeBlanks = false): T[] {
    const results = [];
    for (const id of uuids) {
      const element = this.map[id];
      if (element || includeBlanks) {
        results.push(element);
      }
    }
    return results as T[];
  }

  public set(elements: T | T[]): void {
    elements = Array.isArray(elements) ? elements : [elements];
    if (elements.length === 0) {
      console.warn('Attempting to set 0 elements onto collection');
      return;
    }
    for (const element of elements) {
      this.map[element.uuid!] = element;
      this.setToTypedMap(element);

      /** Dirty index */
      if (element.dirty) {
        this.dirtyIndex.add(element.uuid);
      } else {
        this.dirtyIndex.delete(element.uuid);
      }

      /** Invalids index */
      if (element.errorDecrypting || element.waitingForKey) {
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

  public discard(elements: T | T[]): void {
    elements = Array.isArray(elements) ? elements : [elements];
    for (const element of elements) {
      this.conflictMap.removeFromMap(element.uuid);
      this.referenceMap.removeFromMap(element.uuid);
      this.deleteFromTypedMap(element);
      delete this.map[element.uuid!];
    }
  }

  private setToTypedMap(element: T): void {
    const array = this.typedMap[element.content_type!] || ([] as T[]);
    remove(array, { uuid: element.uuid! as any });
    array.push(element);
    this.typedMap[element.content_type!] = array;
  }

  private deleteFromTypedMap(element: T) {
    const array = this.typedMap[element.content_type!] || ([] as T[]);
    remove(array, { uuid: element.uuid! as any });
    this.typedMap[element.content_type!] = array;
  }

  public uuidsThatReferenceUuid(uuid: UuidString) {
    if (!isString(uuid)) {
      throw Error('Must use uuid string');
    }
    return this.referenceMap.getInverseRelationships(uuid);
  }

  public elementsReferencingElement(element: T, contentType?: ContentType) {
    const uuids = this.uuidsThatReferenceUuid(element.uuid);
    const items = this.findAll(uuids) as T[];
    if (!contentType) {
      return items;
    }
    return items.filter((item) => item.content_type === contentType);
  }

  public uuidReferencesForUuid(uuid: UuidString) {
    if (!isString(uuid)) {
      throw Error('Must use uuid string');
    }
    return this.referenceMap.getDirectRelationships(uuid);
  }

  public referencesForElement(element: T) {
    const uuids = this.referenceMap.getDirectRelationships(element.uuid);
    return this.findAll(uuids) as T[];
  }

  public conflictsOf(uuid: UuidString) {
    const uuids = this.conflictMap.getDirectRelationships(uuid);
    return this.findAll(uuids) as T[];
  }
}

import { PayloadSource } from '@Payloads/sources';
import { UuidMap } from './uuid_map';
import { isString, extendArray, addAtIndex, isNullOrUndefined, removeFromIndex, compareValues } from '@Lib/utils';
import { SNItem } from './../../models/core/item';
import remove from 'lodash/remove';
import { ContentType } from '@Models/content_types';
import { UuidString } from './../../types';
import { PurePayload } from '@Payloads/pure_payload';
import sortedIndexBy from 'lodash/sortedIndexBy';

type Payloadable = PurePayload | SNItem

export enum CollectionSort {
  CreatedAt = 'created_at',
  UpdatedAt = 'userModifiedDate',
  Title = 'title'
}
export type SortDirection = 'asc' | 'dsc'

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
      if (Array.isArray(contentType)) {
        const elements = [] as T[];
        for (const type of contentType) {
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
    /** Display filter/sort */
    this.filterSortElements(elements);
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

  private displaySortBy: Partial<Record<ContentType, { key: CollectionSort, dir: SortDirection }>> = {};
  private displayFilter: Partial<Record<ContentType, (element: T) => boolean>> = {};

  /** A display ready map of uuids-to-position in sorted array. i.e filteredMap[contentType]
   * returns {uuid_123: 1, uuid_456: 2}, where 1 and 2 are the positions of the element
   * in the sorted array. We keep track of positions so that when we want to re-sort or remove
   * and element, we don't have to search the entire sorted array to do so. */
  private filteredMap: Partial<Record<ContentType, Record<UuidString, number>>> = {};
  /** A sorted representation of the filteredMap, where sortedMap[contentType] returns
   * an array of sorted elements, based on the current displaySortBy */
  private sortedMap: Partial<Record<ContentType, Array<T | undefined>>> = {};

  /**
   * Sets an optional sortBy and filter for a given content type. These options will be
   * applied against a separate "display-only" record and not the master record. Passing
   * null options removes any existing options. sortBy is always required, but a filter is 
   * not always required. 
   * Note that sorting and filtering only applies to collections of type SNItem, and not
   * payloads. This is because we access item properties such as `pinned` and `title`.
   * @param filter A function that receives an element and returns a boolean indicating
   * whether the element passes the filter and should be in displayable results.
   */
  public setDisplayOptions(
    contentType: ContentType,
    sortBy?: CollectionSort,
    direction?: SortDirection,
    filter?: (element: T) => boolean
  ) {
    const existingSortBy = this.displaySortBy[contentType];
    const existingFilter = this.displayFilter[contentType];
    /** If the sort value is unchanged, and we are not setting a new filter,
     * we return, as to not rebuild and resort all elements */
    if (
      existingSortBy && 
      existingSortBy.key === sortBy && existingSortBy.dir === direction &&
      !existingFilter && !filter
    ) {
      return;
    }
    this.displaySortBy[contentType] = sortBy ? { key: sortBy, dir: direction! } : undefined;
    this.displayFilter[contentType] = filter;
    /** Reset existing maps */
    this.filteredMap[contentType] = {};
    this.sortedMap[contentType] = [];
    /** Re-process all elements */
    const elements = this.all(contentType);
    this.filterSortElements(elements);
  }

  /** Returns the filtered and sorted list of elements for this content type,
   * according to the options set via `setDisplayOptions` */
  public displayElements(contentType: ContentType) {
    const elements = this.sortedMap[contentType];
    if (!elements) {
      throw Error(`Attempting to access display elements for non-configured content type ${contentType}`);
    }
    return elements;
  }

  private filterSortElements(elements: T[]) {
    if (Object.keys(this.displaySortBy).length === 0) {
      return;
    }
    /** If a content type is added to this set, we are indicating the entire sorted 
     * array will need to be re-sorted. The reason for sorting the entire array and not 
     * just inserting an element using binary search is that we need to keep track of the 
     * sorted index of an item so that we can look up and change its value without having
     * to search the array for it. */
    const typesNeedingResort = new Set<ContentType>();
    for (const element of elements) {
      const contentType = element.content_type;
      const sortBy = this.displaySortBy[contentType];
      /** Sort by is required, but filter is not */
      if (!sortBy) {
        continue;
      }
      const filter = this.displayFilter[contentType];
      /** Filtered content type map */
      const filteredCTMap = this.filteredMap[contentType]!;
      const sortedElements = this.sortedMap[contentType]!;
      /** If no filter the element passes by default */
      const passes = element.deleted ? false : (filter ? filter(element) : true);
      const currentIndex = filteredCTMap[element.uuid];
      if (passes) {
        if (!isNullOrUndefined(currentIndex)) {
          /** Check to see if the element has changed its sort value. If so, we need to re-sort */
          const previousValue = (sortedElements[currentIndex] as any)[sortBy.key];
          const newValue = (element as any)[sortBy.key];
          /** Replace the current element with the new one. */
          sortedElements[currentIndex] = element;
          if (!compareValues(previousValue, newValue)) {
            /** Needs resort because its re-sort value has changed, 
             * and thus its position might change */
            typesNeedingResort.add(contentType);
          }
        } else {
          /** Has not yet been inserted */
          sortedElements.push(element);
          /** Needs re-sort because we're just pushing the element to the end here */
          typesNeedingResort.add(contentType);
        }
      } else {
        /** Doesn't pass filter, remove from sorted and filtered */
        if (!isNullOrUndefined(currentIndex)) {
          delete filteredCTMap[element.uuid];
          /** We don't yet remove the element directly from the array, since mutating
           * the array inside a loop could render all other upcoming indexes invalid */
          (sortedElements[currentIndex] as any) = undefined;
          /** Since an element is being removed from the array, we need to recompute
           * the new positions for elements that are staying */
          typesNeedingResort.add(contentType);
        }
      }
    }

    for (const contentType of typesNeedingResort.values()) {
      const sortedElements = this.sortedMap[contentType]!;
      const sortBy = this.displaySortBy[contentType]!;
      const filteredCTMap = this.filteredMap[contentType]!;
      /** Resort the elements array, and update the saved positions */
      /** @O(n * log(n)) */
      const sortFn = (a?: any, b?: any, skipPinnedCheck = false): number => {
        /** If the elements are undefined, move to beginning */
        if (!a) { return -1; }
        if (!b) { return 1; }
        if (!skipPinnedCheck) {
          if (a.pinned && b.pinned) {
            return sortFn(a, b, true);
          }
          if (a.pinned) { return -1; }
          if (b.pinned) { return 1; }
        }
        let aValue = (a as any)[sortBy.key] || '';
        let bValue = (b as any)[sortBy.key] || '';
        let vector = 1;
        if (sortBy.dir === 'asc') {
          vector *= -1;
        }
        if (sortBy.key === CollectionSort.Title) {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
          if (aValue.length === 0 && bValue.length === 0) {
            return 0;
          } else if (aValue.length === 0 && bValue.length !== 0) {
            return 1 * vector;
          } else if (aValue.length !== 0 && bValue.length === 0) {
            return -1 * vector;
          } else {
            vector *= -1;
          }
        }
        if (aValue > bValue) { return -1 * vector; }
        else if (aValue < bValue) { return 1 * vector; }
        return 0;
      }
      const resorted = sortedElements.sort((a, b) => {
        return sortFn(a, b);
      });
      /** Now that resorted contains the sorted elements (but also can contain undefined element) 
       * we create another array that filters out any of the undefinedes. We also keep track of the
       * current index while we loop and set that in the filteredCTMap. */
      const cleaned = [] as T[];
      let currentIndex = 0;
      /** @O(n) */
      for (const element of resorted) {
        if (!element) {
          continue;
        }
        cleaned.push(element);
        filteredCTMap[element.uuid] = currentIndex;
        currentIndex++;
      }
      this.sortedMap[contentType] = cleaned;
    }
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

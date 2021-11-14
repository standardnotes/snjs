import { MutableCollection } from './collection';
import { compareValues, isNullOrUndefined, uniqueArrayByKey } from '@Lib/utils';
import { SNItem } from './../../models/core/item';
import { ContentType } from '@Models/content_types';
import { UuidString } from './../../types';

export enum CollectionSort {
  CreatedAt = 'created_at',
  UpdatedAt = 'userModifiedDate',
  Title = 'title',
}
export type SortDirection = 'asc' | 'dsc';

/** The item collection class builds on mutable collection by providing an option to keep
 * items sorted and filtered. */
export class ItemCollection extends MutableCollection<SNItem> {
  private displaySortBy: Partial<
    Record<
      ContentType,
      {
        key: CollectionSort;
        dir: SortDirection;
      }
    >
  > = {};
  private displayFilter: Partial<
    Record<ContentType, (element: SNItem) => boolean>
  > = {};

  /** A display ready map of uuids-to-position in sorted array. i.e filteredMap[contentType]
   * returns {uuid_123: 1, uuid_456: 2}, where 1 and 2 are the positions of the element
   * in the sorted array. We keep track of positions so that when we want to re-sort or remove
   * and element, we don't have to search the entire sorted array to do so. */
  private filteredMap: Partial<
    Record<ContentType, Record<UuidString, number>>
  > = {};
  /** A sorted representation of the filteredMap, where sortedMap[contentType] returns
   * an array of sorted elements, based on the current displaySortBy */
  private sortedMap: Partial<
    Record<ContentType, SNItem[]>
  > = {};

  public set(elements: SNItem | SNItem[]): void {
    elements = uniqueArrayByKey(
      Array.isArray(elements) ? elements : [elements],
      'uuid'
    );
    super.set(elements);
    this.filterSortElements(elements);
  }

  public discard(elements: SNItem | SNItem[]): void {
    elements = Array.isArray(elements) ? elements : [elements];
    super.discard(elements);
    this.filterSortElements(elements);
  }

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
    sortBy = CollectionSort.CreatedAt,
    direction: SortDirection = 'asc',
    filter?: (element: SNItem) => boolean
  ): void {
    const existingSortBy = this.displaySortBy[contentType];
    const existingFilter = this.displayFilter[contentType];
    /** If the sort value is unchanged, and we are not setting a new filter,
     * we return, as to not rebuild and resort all elements */
    if (
      existingSortBy &&
      existingSortBy.key === sortBy &&
      existingSortBy.dir === direction &&
      !existingFilter &&
      !filter
    ) {
      return;
    }
    this.displaySortBy[contentType] = sortBy
      ? { key: sortBy, dir: direction }
      : undefined;
    this.displayFilter[contentType] = filter;
    /** Reset existing maps */
    this.filteredMap[contentType] = {};
    this.sortedMap[contentType] = [];
    /** Re-process all elements */
    const elements = this.all(contentType);
    if (elements.length > 0) {
      this.filterSortElements(elements);
    }
  }

  /** Returns the filtered and sorted list of elements for this content type,
   * according to the options set via `setDisplayOptions` */
  public displayElements(contentType: ContentType): SNItem[] {
    const elements = this.sortedMap[contentType];
    if (!elements) {
      throw Error(
        `Attempting to access display elements for
        non-configured content type ${contentType}`
      );
    }
    return elements.slice();
  }

  private filterSortElements(elements: SNItem[]) {
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
      const previousIndex = filteredCTMap[element.uuid];
      const previousElement = !isNullOrUndefined(previousIndex)
        ? sortedElements[previousIndex]
        : undefined;
      /** If the element is deleted, or if it no longer exists in the primary map (because
       * it was discarded without neccessarily being marked as deleted), it does not pass
       * the filter. If no filter the element passes by default. */
      const passes =
        element.deleted || !this.map[element.uuid]
          ? false
          : filter
          ? filter(element)
          : true;
      if (passes) {
        if (!isNullOrUndefined(previousElement)) {
          /** Check to see if the element has changed its sort value. If so, we need to re-sort.
           * Previous element might be encrypted. */
          const previousValue:
            | SNItem
            | undefined = previousElement.errorDecrypting
            ? undefined
            : previousElement[sortBy.key as keyof SNItem];
          const newValue = (element as any)[sortBy.key];
          /** Replace the current element with the new one. */
          sortedElements[previousIndex] = element;
          /** If the pinned status of the element has changed, it needs to be resorted */
          const pinChanged = previousElement!.pinned !== element.pinned;
          if (!compareValues(previousValue, newValue) || pinChanged) {
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
        if (!isNullOrUndefined(previousIndex)) {
          delete filteredCTMap[element.uuid];
          /** We don't yet remove the element directly from the array, since mutating
           * the array inside a loop could render all other upcoming indexes invalid */
          (sortedElements[previousIndex] as any) = undefined;
          /** Since an element is being removed from the array, we need to recompute
           * the new positions for elements that are staying */
          typesNeedingResort.add(contentType);
        }
      }
    }

    for (const contentType of typesNeedingResort.values()) {
      this.resortContentType(contentType);
    }
  }

  private resortContentType(contentType: ContentType) {
    const sortedElements = this.sortedMap[contentType]!;
    const sortBy = this.displaySortBy[contentType]!;
    const filteredCTMap = this.filteredMap[contentType]!;
    /** Resort the elements array, and update the saved positions */
    /** @O(n * log(n)) */
    const sortFn = (
      a?: SNItem,
      b?: SNItem,
      skipPinnedCheck = false
    ): number => {
      /** If the elements are undefined, move to beginning */
      if (!a) {
        return -1;
      }
      if (!b) {
        return 1;
      }
      if (!skipPinnedCheck) {
        if (a.pinned && b.pinned) {
          return sortFn(a, b, true);
        }
        if (a.pinned) {
          return -1;
        }
        if (b.pinned) {
          return 1;
        }
      }
      const aValue: string = (a as any)[sortBy.key] || '';
      const bValue: string = (b as any)[sortBy.key] || '';
      let vector = 1;
      if (sortBy.dir === 'asc') {
        vector *= -1;
      }
      if (sortBy.key === CollectionSort.Title) {
        return vector * aValue.localeCompare(bValue, 'en', { numeric: true });
      } else if (aValue > bValue) {
        return -1 * vector;
      } else if (aValue < bValue) {
        return 1 * vector;
      } else {
        return 0;
      }
    };
    const resorted = sortedElements.sort((a, b) => {
      return sortFn(a, b);
    });
    /** Now that resorted contains the sorted elements (but also can contain undefined element)
     * we create another array that filters out any of the undefinedes. We also keep track of the
     * current index while we loop and set that in the filteredCTMap. */
    const cleaned = [] as SNItem[];
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

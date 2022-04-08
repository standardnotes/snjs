import { CollectionSortDirection, CollectionSort } from '../CollectionSort'
import { ContentType, Uuid } from '@standardnotes/common'
import { compareValues, isNullOrUndefined, uniqueArrayByKey, UuidMap } from '@standardnotes/utils'
import { SNIndex } from '../../Index/SNIndex'
import { ItemDelta } from '../../Index/ItemDelta'
import { isDeletedItem, isEncryptedErroredItem } from '../../../Abstract/Item/Interfaces/TypeCheck'
import { isNote } from '../../../Syncable/Note'
import { DecryptedItemInterface } from '../../../Abstract/Item/Interfaces/DecryptedItem'
import { CollectionInterface } from '../CollectionInterface'
import { DeletedItemInterface } from '../../../Abstract/Item'
import { Collection } from '../Collection'
import { ItemContent } from '../../../Abstract/Content/ItemContent'

export class ItemCollection
  extends Collection<DecryptedItemInterface, DeletedItemInterface>
  implements SNIndex, CollectionInterface
{
  private displaySortBy: Partial<
    Record<
      ContentType,
      {
        key: keyof DecryptedItemInterface
        dir: CollectionSortDirection
      }
    >
  > = {}

  private displayFilter: Partial<
    Record<ContentType, (element: DecryptedItemInterface) => boolean>
  > = {}

  readonly referenceMap: UuidMap

  /**
   * A display ready map of uuids-to-position in sorted array. i.e filteredMap[contentType]
   * returns {uuid_123: 1, uuid_456: 2}, where 1 and 2 are the positions of the element
   * in the sorted array. We keep track of positions so that when we want to re-sort or remove
   * and element, we don't have to search the entire sorted array to do so.
   */
  private filteredMap: Partial<Record<ContentType, Record<Uuid, number>>> = {}

  /**
   * A sorted representation of the filteredMap, where sortedMap[contentType] returns
   * an array of sorted elements, based on the current displaySortBy
   */
  private sortedMap: Partial<Record<ContentType, DecryptedItemInterface[]>> = {}

  constructor(
    copy = false,
    mapCopy?: Partial<Record<Uuid, DecryptedItemInterface>>,
    typedMapCopy?: Partial<Record<ContentType, DecryptedItemInterface[]>>,
    referenceMapCopy?: UuidMap,
  ) {
    super(copy, mapCopy, typedMapCopy)
    if (copy) {
      this.referenceMap = referenceMapCopy!
    } else {
      this.referenceMap = new UuidMap()
    }
  }

  public override set(elements: (DecryptedItemInterface | DeletedItemInterface)[]): void {
    super.set(elements)

    elements = uniqueArrayByKey(Array.isArray(elements) ? elements : [elements], 'uuid')

    for (const element of elements) {
      if (isDeletedItem(element)) {
        this.referenceMap.removeFromMap(element.uuid)
      } else {
        this.referenceMap.setAllRelationships(
          element.uuid,
          element.references.map((r) => r.uuid),
        )
      }
    }

    this.filterSortElements(elements)
  }

  public override discard(elements: (DecryptedItemInterface | DeletedItemInterface)[]): void {
    super.discard(elements)

    elements = Array.isArray(elements) ? elements : [elements]

    for (const element of elements) {
      this.referenceMap.removeFromMap(element.uuid)
    }

    this.filterSortElements(elements)
  }

  public onChange(delta: ItemDelta): void {
    const changedOrInserted = delta.changed.concat(delta.inserted)

    if (changedOrInserted.length > 0) {
      this.set(changedOrInserted)
    }

    this.discard(delta.discarded)
  }

  public uuidReferencesForUuid(uuid: Uuid): Uuid[] {
    return this.referenceMap.getDirectRelationships(uuid)
  }

  public uuidsThatReferenceUuid(uuid: Uuid): Uuid[] {
    return this.referenceMap.getInverseRelationships(uuid)
  }

  public elementsReferencingElement<
    C extends ItemContent = ItemContent,
    E extends DecryptedItemInterface<C> = DecryptedItemInterface<C>,
  >(element: E, contentType?: ContentType): DecryptedItemInterface[] {
    const uuids = this.uuidsThatReferenceUuid(element.uuid)
    const items = this.findAllNondeleted(uuids)

    if (!contentType) {
      return items
    }

    return items.filter((item) => item.content_type === contentType)
  }

  /**
   * Sets an optional sortBy and filter for a given content type. These options will be
   * applied against a separate "display-only" record and not the master record. Passing
   * null options removes any existing options. sortBy is always required, but a filter is
   * not always required.
   * Note that sorting and filtering only applies to collections of type ItemInterface, and not
   * payloads. This is because we access item properties such as `pinned` and `title`.
   * @param filter A function that receives an element and returns a boolean indicating
   * whether the element passes the filter and should be in displayable results.
   */
  public setDisplayOptions(
    contentType: ContentType,
    sortBy = CollectionSort.CreatedAt,
    direction: CollectionSortDirection = 'asc',
    filter?: (element: DecryptedItemInterface) => boolean,
  ): void {
    const existingSortBy = this.displaySortBy[contentType]
    const existingFilter = this.displayFilter[contentType]
    /** If the sort value is unchanged, and we are not setting a new filter,
     * we return, as to not rebuild and resort all elements */
    if (
      existingSortBy &&
      existingSortBy.key === sortBy &&
      existingSortBy.dir === direction &&
      !existingFilter &&
      !filter
    ) {
      return
    }
    this.displaySortBy[contentType] = sortBy ? { key: sortBy, dir: direction } : undefined
    this.displayFilter[contentType] = filter
    /** Reset existing maps */
    this.filteredMap[contentType] = {}
    this.sortedMap[contentType] = []

    const elements = this.all(contentType)
    if (elements.length > 0) {
      this.filterSortElements(elements)
    }
  }

  /**
   * Returns the filtered and sorted list of elements for this content type,
   * according to the options set via `setDisplayOptions`
   */
  public displayElements<I extends DecryptedItemInterface = DecryptedItemInterface>(
    contentType: ContentType,
  ): I[] {
    const elements = this.sortedMap[contentType]
    if (!elements) {
      throw Error(
        `Attempting to access display elements for
       non-configured content type ${contentType}`,
      )
    }
    return elements.slice() as I[]
  }

  private filterSortElements(elements: (DecryptedItemInterface | DeletedItemInterface)[]) {
    if (Object.keys(this.displaySortBy).length === 0) {
      return
    }

    /** If a content type is added to this set, we are indicating the entire sorted
     * array will need to be re-sorted. The reason for sorting the entire array and not
     * just inserting an element using binary search is that we need to keep track of the
     * sorted index of an item so that we can look up and change its value without having
     * to search the array for it. */
    const typesNeedingResort = new Set<ContentType>()
    for (const element of elements) {
      const contentType = element.content_type
      const sortBy = this.displaySortBy[contentType]
      /** Sort by is required, but filter is not */

      if (!sortBy) {
        continue
      }

      const filter = this.displayFilter[contentType]
      /** Filtered content type map */
      const filteredCTMap = this.filteredMap[contentType]!
      const sortedElements = this.sortedMap[contentType]!
      const previousIndex = filteredCTMap[element.uuid]
      const previousElement = !isNullOrUndefined(previousIndex)
        ? sortedElements[previousIndex]
        : undefined

      /**
       * If the element is deleted, or if it no longer exists in the primary map (because
       * it was discarded without neccessarily being marked as deleted), it does not pass
       * the filter. If no filter the element passes by default.
       */

      const remove = () => {
        if (!isNullOrUndefined(previousIndex)) {
          delete filteredCTMap[element.uuid]

          /** We don't yet remove the element directly from the array, since mutating
           * the array inside a loop could render all other upcoming indexes invalid */
          ;(sortedElements[previousIndex] as unknown) = undefined

          /** Since an element is being removed from the array, we need to recompute
           * the new positions for elements that are staying */
          typesNeedingResort.add(contentType)
        }
      }

      if (isDeletedItem(element)) {
        remove()
        continue
      }

      const passes = !this.map[element.uuid] ? false : filter ? filter(element) : true

      if (passes) {
        if (!isNullOrUndefined(previousElement)) {
          /**
           * Check to see if the element has changed its sort value.
           * If so, we need to re-sort. Previous element might be encrypted.
           */
          const previousValue = isEncryptedErroredItem(previousElement)
            ? undefined
            : previousElement[sortBy.key]

          const newValue = (element as any)[sortBy.key]

          /** Replace the current element with the new one. */
          sortedElements[previousIndex] = element

          /** If the pinned status of the element has changed, it needs to be resorted */
          const pinChanged = previousElement!.pinned !== element.pinned

          if (!compareValues(previousValue, newValue) || pinChanged) {
            /** Needs resort because its re-sort value has changed,
             * and thus its position might change */
            typesNeedingResort.add(contentType)
          }
        } else {
          /** Has not yet been inserted */
          sortedElements.push(element)

          /** Needs re-sort because we're just pushing the element to the end here */
          typesNeedingResort.add(contentType)
        }
      } else {
        /** Doesn't pass filter, remove from sorted and filtered */
        remove()
      }
    }

    for (const contentType of typesNeedingResort.values()) {
      this.resortContentType(contentType)
    }
  }

  private resortContentType(contentType: ContentType) {
    const sortedElements = this.sortedMap[contentType]!
    const sortBy = this.displaySortBy[contentType]!
    const filteredCTMap = this.filteredMap[contentType]!

    /** Resort the elements array, and update the saved positions */
    /** @O(n * log(n)) */
    const sortFn = (
      a?: DecryptedItemInterface,
      b?: DecryptedItemInterface,
      skipPinnedCheck = false,
    ): number => {
      /** If the elements are undefined, move to beginning */
      if (!a) {
        return -1
      }
      if (!b) {
        return 1
      }

      if (!skipPinnedCheck && isNote(a) && isNote(b)) {
        if (a.pinned && b.pinned) {
          return sortFn(a, b, true)
        }
        if (a.pinned) {
          return -1
        }
        if (b.pinned) {
          return 1
        }
      }

      const aValue: string = (a as any)[sortBy.key] || ''
      const bValue: string = (b as any)[sortBy.key] || ''
      let vector = 1

      if (sortBy.dir === 'asc') {
        vector *= -1
      }
      /**
       * Check for string length due to issue on React Native 0.65.1
       * where empty strings causes crash:
       * https://github.com/facebook/react-native/issues/32174
       * */
      if (sortBy.key === CollectionSort.Title && aValue.length > 0 && bValue.length > 0) {
        return vector * aValue.localeCompare(bValue, 'en', { numeric: true })
      } else if (aValue > bValue) {
        return -1 * vector
      } else if (aValue < bValue) {
        return 1 * vector
      } else {
        return 0
      }
    }

    const resorted = sortedElements.sort((a, b) => {
      return sortFn(a, b)
    })

    /** Now that resorted contains the sorted elements (but also can contain undefined element)
     * we create another array that filters out any of the undefinedes. We also keep track of the
     * current index while we loop and set that in the filteredCTMap. */
    const cleaned = []
    let currentIndex = 0

    /** @O(n) */
    for (const element of resorted) {
      if (!element) {
        continue
      }
      cleaned.push(element)
      filteredCTMap[element.uuid] = currentIndex
      currentIndex++
    }

    this.sortedMap[contentType] = cleaned
  }
}

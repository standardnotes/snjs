import { isString } from '@standardnotes/utils'
import { CollectionSort, CollectionSortDirection, CollectionSortProperty } from '../Collection/CollectionSort'
import { DisplayItem } from './Types'

/** @O(n * log(n)) */
export function sortTwoItems(
  a: DisplayItem | undefined,
  b: DisplayItem | undefined,
  sortBy: CollectionSortProperty,
  sortDirection: CollectionSortDirection,
  bypassPinCheck = false,
): number {
  /** If the elements are undefined, move to beginning */
  if (!a) {
    return -1
  }

  if (!b) {
    return 1
  }

  if (!bypassPinCheck) {
    if (a.pinned && b.pinned) {
      return sortTwoItems(a, b, sortBy, sortDirection, true)
    }
    if (a.pinned) {
      return -1
    }
    if (b.pinned) {
      return 1
    }
  }

  const aValue = a[sortBy] || ''
  const bValue = b[sortBy] || ''
  const smallerNaturallyComesFirst = sortDirection === 'asc'
  let compareResult = 0

  /**
   * Check for string length due to issue on React Native 0.65.1
   * where empty strings causes crash:
   * https://github.com/facebook/react-native/issues/32174
   * */
  if (
    sortBy === CollectionSort.Title &&
    isString(aValue) &&
    isString(bValue) &&
    aValue.length > 0 &&
    bValue.length > 0
  ) {
    compareResult = aValue.localeCompare(bValue, 'en', { numeric: true })
  } else if (aValue > bValue) {
    compareResult = 1
  } else if (aValue < bValue) {
    compareResult = -1
  } else {
    compareResult = 0
  }

  const isLeftSmaller = compareResult === -1
  const isLeftBigger = compareResult === 1

  if (isLeftSmaller) {
    if (smallerNaturallyComesFirst) {
      return -1
    } else {
      return 1
    }
  } else if (isLeftBigger) {
    if (smallerNaturallyComesFirst) {
      return 1
    } else {
      return -1
    }
  } else {
    return 0
  }
}

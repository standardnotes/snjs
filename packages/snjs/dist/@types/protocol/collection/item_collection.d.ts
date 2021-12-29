import { MutableCollection } from './collection';
import { SNItem } from './../../models/core/item';
import { ContentType } from '../../models/content_types';
export declare enum CollectionSort {
    CreatedAt = "created_at",
    UpdatedAt = "userModifiedDate",
    Title = "title"
}
export declare type SortDirection = 'asc' | 'dsc';
/** The item collection class builds on mutable collection by providing an option to keep
 * items sorted and filtered. */
export declare class ItemCollection extends MutableCollection<SNItem> {
    private displaySortBy;
    private displayFilter;
    /** A display ready map of uuids-to-position in sorted array. i.e filteredMap[contentType]
     * returns {uuid_123: 1, uuid_456: 2}, where 1 and 2 are the positions of the element
     * in the sorted array. We keep track of positions so that when we want to re-sort or remove
     * and element, we don't have to search the entire sorted array to do so. */
    private filteredMap;
    /** A sorted representation of the filteredMap, where sortedMap[contentType] returns
     * an array of sorted elements, based on the current displaySortBy */
    private sortedMap;
    set(elements: SNItem | SNItem[]): void;
    discard(elements: SNItem | SNItem[]): void;
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
    setDisplayOptions(contentType: ContentType, sortBy?: CollectionSort, direction?: SortDirection, filter?: (element: SNItem) => boolean): void;
    /** Returns the filtered and sorted list of elements for this content type,
     * according to the options set via `setDisplayOptions` */
    displayElements(contentType: ContentType): SNItem[];
    private filterSortElements;
    private resortContentType;
}

/** Grouping of required state variables to perform the search */

import { CollectionSort } from "@Lib/protocol/collection/item_collection";
import { SNTag } from "./tag";

export interface SearchPayload {
    tag: SNTag,
    sortBy: CollectionSort,
    isReversedSort: "asc"|"dsc"|undefined,
    showArchiveOrTrashed: boolean,
    hidePinned: boolean,
    query: string

}

export class Search {

    /**
     * This is a static class so instantiation should be impossible.
     */
    private constructor() {
    }

    public static create(tag: SNTag, 
                         sortBy: CollectionSort, 
                         isReversedSort: "asc"|"dsc", 
                         showArchivedOrTrashed:boolean, 
                         hidePinned: boolean, 
                         query: string) : SearchPayload {
        return {
            tag:tag,
            sortBy:sortBy,
            isReversedSort:isReversedSort,
            showArchiveOrTrashed:showArchivedOrTrashed,
            hidePinned:hidePinned,
            query:query
        }
    }
}


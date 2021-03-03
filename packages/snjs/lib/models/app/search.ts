/** Grouping of required state variables to perform the search */

import { CollectionSort } from "@Lib/protocol/collection/item_collection";
import { SNTag } from "./tag";

export interface SearchQuery {
  tag: SNTag,
  sortBy: CollectionSort,
  direction?: "asc" | "dsc",
  showArchiveOrTrashed: boolean,
  hidePinned: boolean,
  query: string
}

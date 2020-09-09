import { SNNote, SNTag, SNSmartTag, SNItem } from '../../models';
import { ItemCollection, CollectionSort, SortDirection } from "./item_collection";
export declare class NotesCollection {
    private collection;
    private displayedList;
    private tag?;
    needsRebuilding: boolean;
    constructor(collection: ItemCollection);
    private tags;
    notesMatchingSmartTag(smartTag: SNSmartTag, notes: SNNote[]): SNNote[];
    setDisplayOptions(tag?: SNTag, sortBy?: CollectionSort, direction?: SortDirection, filter?: (element: SNItem) => boolean): void;
    private rebuildList;
    displayElements(): SNNote[];
    all(): SNNote[];
}

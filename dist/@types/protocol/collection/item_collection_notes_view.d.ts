import { SNNote, SNTag, SNSmartTag, SNItem } from '../../models';
import { ItemCollection, CollectionSort, SortDirection } from './item_collection';
/**
 * A view into ItemCollection that allows filtering by tag and smart tag.
 */
export declare class ItemCollectionNotesView {
    private collection;
    private displayedList;
    private tagUuid?;
    private needsRebuilding;
    constructor(collection: ItemCollection);
    notesMatchingSmartTag(smartTag: SNSmartTag, notes: SNNote[]): SNNote[];
    setDisplayOptions(tag?: SNTag, sortBy?: CollectionSort, direction?: SortDirection, filter?: (element: SNItem) => boolean): void;
    private rebuildList;
    setNeedsRebuilding(): void;
    displayElements(): SNNote[];
    all(): SNNote[];
}

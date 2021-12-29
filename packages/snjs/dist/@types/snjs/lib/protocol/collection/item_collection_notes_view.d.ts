import { SNSmartTag } from './../../models/app/smartTag';
import { ItemCollection } from './item_collection';
import { SNNote } from '../../models';
import { NotesDisplayCriteria } from './notes_display_criteria';
/**
 * A view into ItemCollection that allows filtering by tag and smart tag.
 */
export declare class ItemCollectionNotesView {
    private collection;
    private criteria;
    private displayedNotes;
    private needsRebuilding;
    constructor(collection: ItemCollection, criteria?: NotesDisplayCriteria);
    setCriteria(criteria: NotesDisplayCriteria): void;
    notesMatchingSmartTag(smartTag: SNSmartTag): SNNote[];
    private rebuildList;
    setNeedsRebuilding(): void;
    displayElements(): SNNote[];
}

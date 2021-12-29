import { SortDirection } from './item_collection';
import { CollectionSort } from './item_collection';
import { SNTag } from './../../models/app/tag';
import { ItemCollection } from './item_collection';
import { SNNote } from './../../models/app/note';
import { SNSmartTag } from './../../models/app/smartTag';
export declare type SearchQuery = {
    query: string;
    includeProtectedNoteText: boolean;
};
export declare class NotesDisplayCriteria {
    searchQuery?: SearchQuery;
    tags: SNTag[];
    includePinned: boolean;
    includeProtected: boolean;
    includeTrashed: boolean;
    includeArchived: boolean;
    sortProperty?: CollectionSort;
    sortDirection?: SortDirection;
    static Create(properties: Partial<NotesDisplayCriteria>): NotesDisplayCriteria;
    static Copy(criteria: NotesDisplayCriteria, override: Partial<NotesDisplayCriteria>): NotesDisplayCriteria;
    computeFilters(collection: ItemCollection): NoteFilter[];
}
declare type NoteFilter = (note: SNNote) => boolean;
export declare function criteriaForSmartTag(tag: SNSmartTag): NotesDisplayCriteria;
export declare function notesMatchingCriteria(criteria: NotesDisplayCriteria, collection: ItemCollection): SNNote[];
export declare function noteMatchesQuery(noteToMatch: SNNote, searchQuery: SearchQuery, noteCollection: ItemCollection): boolean;
export {};

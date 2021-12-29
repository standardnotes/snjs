import { ItemMutator, SNItem } from '../core/item';
import { CollectionSort } from '../../protocol/collection/item_collection';
import { SNPredicate } from '../core/predicate';
export declare enum PrefKey {
    TagsPanelWidth = "tagsPanelWidth",
    NotesPanelWidth = "notesPanelWidth",
    EditorWidth = "editorWidth",
    EditorLeft = "editorLeft",
    EditorMonospaceEnabled = "monospaceFont",
    EditorSpellcheck = "spellcheck",
    EditorResizersEnabled = "marginResizersEnabled",
    SortNotesBy = "sortBy",
    SortNotesReverse = "sortReverse",
    NotesShowArchived = "showArchived",
    NotesShowTrashed = "showTrashed",
    NotesHideProtected = "hideProtected",
    NotesHidePinned = "hidePinned",
    NotesHideNotePreview = "hideNotePreview",
    NotesHideDate = "hideDate",
    NotesHideTags = "hideTags"
}
export declare type PrefValue = {
    [PrefKey.TagsPanelWidth]: number;
    [PrefKey.NotesPanelWidth]: number;
    [PrefKey.EditorWidth]: number | null;
    [PrefKey.EditorLeft]: number | null;
    [PrefKey.EditorMonospaceEnabled]: boolean;
    [PrefKey.EditorSpellcheck]: boolean;
    [PrefKey.EditorResizersEnabled]: boolean;
    [PrefKey.SortNotesBy]: CollectionSort;
    [PrefKey.SortNotesReverse]: boolean;
    [PrefKey.NotesShowArchived]: boolean;
    [PrefKey.NotesShowTrashed]: boolean;
    [PrefKey.NotesHidePinned]: boolean;
    [PrefKey.NotesHideProtected]: boolean;
    [PrefKey.NotesHideNotePreview]: boolean;
    [PrefKey.NotesHideDate]: boolean;
    [PrefKey.NotesHideTags]: boolean;
};
export declare class SNUserPrefs extends SNItem {
    static singletonPredicate: SNPredicate;
    get isSingleton(): true;
    get singletonPredicate(): SNPredicate;
    getPref<K extends PrefKey>(key: K): PrefValue[K] | undefined;
}
export declare class UserPrefsMutator extends ItemMutator {
    setPref<K extends PrefKey>(key: K, value: PrefValue[K]): void;
}

import { SNItem, ItemMutator } from '../core/item';
import { SNPredicate } from '../core/predicate';
export declare enum WebPrefKey {
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
    NotesHidePinned = "hidePinned",
    NotesHideNotePreview = "hideNotePreview",
    NotesHideDate = "hideDate"
}
export declare enum MobilePrefKey {
    SortNotesBy = "sortBy",
    SortNotesReverse = "sortReverse",
    NotesShowArchived = "showArchived",
    NotesHidePinned = "hidePinned",
    NotesHideNotePreview = "hideNotePreview",
    NotesHideDate = "hideDate",
    ThemeData = "themePreferences",
    LastExportDate = "lastExportDate",
    DoNotWarnUnsupportedEditors = "doNotShowAgainUnsupportedEditors"
}
export declare type PrefKey = WebPrefKey | MobilePrefKey;
export declare class SNUserPrefs extends SNItem {
    get isSingleton(): boolean;
    get singletonPredicate(): SNPredicate;
    getPref(key: PrefKey): any;
}
export declare class UserPrefsMutator extends ItemMutator {
    setWebPref(key: WebPrefKey, value: any): void;
    setMobilePref(key: MobilePrefKey, value: any): void;
}

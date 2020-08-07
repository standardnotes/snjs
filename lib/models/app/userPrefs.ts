import { SNItem, ItemMutator } from '@Models/core/item';
import { SNPredicate } from '@Models/core/predicate';

export enum WebPrefKey {
  TagsPanelWidth = 'tagsPanelWidth',
  NotesPanelWidth = 'notesPanelWidth',
  EditorWidth = 'editorWidth',
  EditorLeft = 'editorLeft',
  EditorMonospaceEnabled = 'monospaceFont',
  EditorSpellcheck = 'spellcheck',
  EditorResizersEnabled = 'marginResizersEnabled',
  SortNotesBy = 'sortBy',
  SortNotesReverse = 'sortReverse',
  NotesShowArchived = 'showArchived',
  NotesHidePinned = 'hidePinned',
  NotesHideNotePreview = 'hideNotePreview',
  NotesHideDate = 'hideDate'
};

export enum MobilePrefKey {
  SortNotesBy = 'sortBy',
  SortNotesReverse = 'sortReverse',
  NotesShowArchived = 'showArchived',
  NotesHidePinned = 'hidePinned',
  NotesHideNotePreview = 'hideNotePreview',
  NotesHideDate = 'hideDate',
  ThemeData = 'themePreferences',
  LastExportDate = 'lastExportDate',
  DoNotWarnUnsupportedEditors = 'doNotShowAgainUnsupportedEditors'
}

export type PrefKey = WebPrefKey | MobilePrefKey

export class SNUserPrefs extends SNItem {

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SNPredicate('content_type', '=', this.content_type!);
  }

  getPref(key: PrefKey) {
    return this.getAppDomainValue(key as any);
  }
}

export class UserPrefsMutator extends ItemMutator {
  setWebPref(key: WebPrefKey, value: any) {
    this.setAppDataItem(key as any, value);
  }
  setMobilePref(key: MobilePrefKey, value: any) {
    this.setAppDataItem(key as any, value);
  }
}
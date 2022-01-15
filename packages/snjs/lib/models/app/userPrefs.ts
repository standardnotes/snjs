import { ItemMutator, SNItem } from '@Models/core/item';
import { CollectionSort } from '@Lib/protocol/collection/item_collection';
import { SNPredicate } from '@Models/core/predicate';
import { ContentType } from '@standardnotes/common';

export enum PrefKey {
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
  NotesShowTrashed = 'showTrashed',
  NotesHideProtected = 'hideProtected',
  NotesHidePinned = 'hidePinned',
  NotesHideNotePreview = 'hideNotePreview',
  NotesHideDate = 'hideDate',
  NotesHideTags = 'hideTags',
  NotesHideEditorIcon = 'hideEditorIcon',
  UseDeviceThemeSettings = 'useDeviceThemeSettings',
  AutomaticLightTheme = 'autoLightTheme',
  AutomaticDarkTheme = 'autoDarkTheme',
}

export type PrefValue = {
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
  [PrefKey.NotesHideEditorIcon]: boolean;
  [PrefKey.UseDeviceThemeSettings]: boolean;
  [PrefKey.AutomaticLightTheme]: string;
  [PrefKey.AutomaticDarkTheme]: string;
};

export class SNUserPrefs extends SNItem {
  static singletonPredicate = new SNPredicate(
    'content_type',
    '=',
    ContentType.UserPrefs
  );

  get isSingleton(): true {
    return true;
  }

  get singletonPredicate(): SNPredicate {
    return SNUserPrefs.singletonPredicate;
  }

  getPref<K extends PrefKey>(key: K): PrefValue[K] | undefined {
    return this.getAppDomainValue(key);
  }
}

export class UserPrefsMutator extends ItemMutator {
  setPref<K extends PrefKey>(key: K, value: PrefValue[K]): void {
    this.setAppDataItem(key, value);
  }
}

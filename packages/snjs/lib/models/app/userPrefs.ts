import { ItemMutator, SNItem } from '@Models/core/item';
import { CollectionSort } from '@Lib/protocol/collection/item_collection';
import { SNPredicate } from '@Models/core/predicate';
import { ContentType } from '../content_types';

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
  NotesHidePinned = 'hidePinned',
  NotesHideNotePreview = 'hideNotePreview',
  NotesHideDate = 'hideDate',
  NotesHideTags = 'hideTags',
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
  [PrefKey.NotesHidePinned]: boolean;
  [PrefKey.NotesHideNotePreview]: boolean;
  [PrefKey.NotesHideDate]: boolean;
  [PrefKey.NotesHideTags]: boolean;
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

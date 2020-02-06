import { NoteHistoryEntry } from './note_history_entry';
import { ContentTypes } from '@Models/content_types';
export function CreateHistoryEntryForItem(item) {
  const mapping = {
    [ContentTypes.Note]: NoteHistoryEntry
  };
  const historyItemClass = mapping[item.content_type];
  if (!historyItemClass) {
    throw 'Invalid item history class';
  }
  // eslint-disable-next-line new-cap
  const entry = new historyItemClass(item);
  return entry;
}
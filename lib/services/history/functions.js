import { NoteHistoryEntry } from './note_history_entry';
import { ContentTypes } from '@Models';
export function CreateHistoryEntryForItem(item) {
  const mapping = {
    [ContentTypes.Note]: NoteHistoryEntry
  };
  const historyItemClass = mapping[item.content_type];
  if (!historyItemClass) {
    throw 'Invalid item history class';
  }
  const entry = new historyItemClass(item);
  return entry;
}
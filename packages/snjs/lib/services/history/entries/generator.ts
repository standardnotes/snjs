import { PayloadField, SurePayload } from '@standardnotes/payloads';
import { ContentType } from '@standardnotes/common';
import { HistoryEntry } from './history_entry';
import { NoteHistoryEntry } from './note_history_entry';

export function CreateHistoryEntryForPayload(
  payload: SurePayload,
  previousEntry?: HistoryEntry
): HistoryEntry {
  const type = payload[PayloadField.ContentType] as ContentType;
  const historyItemClass = historyClassForContentType(type);
  // eslint-disable-next-line new-cap
  const entry = new historyItemClass(payload, previousEntry);
  return entry;
}

function historyClassForContentType(contentType: ContentType) {
  switch (contentType) {
    case ContentType.Note:
      return NoteHistoryEntry;
    default:
      return HistoryEntry;
  }
}

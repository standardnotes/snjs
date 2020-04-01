import { PayloadField } from '@Payloads/index';
import { PurePayload } from '@Payloads/pure_payload';
import { NoteHistoryEntry } from './note_history_entry';
import { ContentType } from '@Models/content_types';
export function CreateHistoryEntryForPayload(payload: PurePayload) {
  const mapping = {
    [ContentType.Note]: NoteHistoryEntry
  } as Partial<Record<ContentType, any>>;
  const type = payload[PayloadField.ContentType] as ContentType;
  const historyItemClass = mapping[type];
  if (!historyItemClass) {
    throw 'Invalid item history class';
  }
  // eslint-disable-next-line new-cap
  const entry = new historyItemClass(payload);
  return entry;
}
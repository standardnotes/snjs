import { PayloadFields } from '@Payloads/index';
import { PurePayload } from '@Payloads/pure_payload';
import { NoteHistoryEntry } from './note_history_entry';
import { ContentTypes } from '@Models/content_types';
export function CreateHistoryEntryForPayload(payload: PurePayload) {
  const mapping = {
    [ContentTypes.Note]: NoteHistoryEntry
  } as Partial<Record<ContentTypes, any>>;
  const type = payload[PayloadFields.ContentType] as ContentTypes;
  const historyItemClass = mapping[type];
  if (!historyItemClass) {
    throw 'Invalid item history class';
  }
  // eslint-disable-next-line new-cap
  const entry = new historyItemClass(payload);
  return entry;
}
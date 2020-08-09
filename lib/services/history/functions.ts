import { PayloadField } from './../../protocol/payloads/fields';
import { PurePayload } from '@Payloads/pure_payload';
import { NoteHistoryEntry } from './note_history_entry';
import { ContentType } from '@Models/content_types';
import { ItemHistorySource } from './item_history_entry';

export function CreateHistoryEntryForPayload(payload: PurePayload, source: ItemHistorySource) {
  const mapping = {
    [ContentType.Note]: NoteHistoryEntry
  } as Partial<Record<ContentType, any>>;
  const type = payload[PayloadField.ContentType] as ContentType;
  const historyItemClass = mapping[type];
  if (!historyItemClass) {
    throw 'Invalid item history class';
  }
  // eslint-disable-next-line new-cap
  const entry = new historyItemClass(payload, source);
  return entry;
}
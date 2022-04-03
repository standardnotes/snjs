import { DecryptedPayloadInterface } from './../../Abstract/Payload/Interfaces/DecryptedPayload'
import { ContentType } from '@standardnotes/common'
import { NoteContent } from '../../Syncable/Note'
import { PayloadField } from '../../Abstract/Payload/Types/PayloadField'
import { HistoryEntry } from './HistoryEntry'
import { NoteHistoryEntry } from './NoteHistoryEntry'

export function CreateHistoryEntryForPayload(
  payload: DecryptedPayloadInterface<NoteContent>,
  previousEntry?: HistoryEntry,
): HistoryEntry {
  const type = payload[PayloadField.ContentType] as ContentType
  const historyItemClass = historyClassForContentType(type)
  // eslint-disable-next-line new-cap
  const entry = new historyItemClass(payload, previousEntry)
  return entry
}

function historyClassForContentType(contentType: ContentType) {
  switch (contentType) {
    case ContentType.Note:
      return NoteHistoryEntry
    default:
      return HistoryEntry
  }
}

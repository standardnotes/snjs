import { ContentType } from '@standardnotes/common'
import { NoteContent } from '../../Syncable/Note'
import { PayloadField } from '../../Abstract/Payload/PayloadField'
import { SurePayload } from '../../Abstract/Payload/SurePayload'
import { HistoryEntry } from './HistoryEntry'
import { NoteHistoryEntry } from './NoteHistoryEntry'

export function CreateHistoryEntryForPayload(
  payload: SurePayload<NoteContent>,
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

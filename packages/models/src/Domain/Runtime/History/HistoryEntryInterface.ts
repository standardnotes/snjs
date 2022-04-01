import { ItemInterface } from './../../Abstract/Item/ItemInterface'
import { SurePayload } from '../../Abstract/Payload/SurePayload'
import { NoteContent } from '../../Syncable/Note'

export interface HistoryEntryInterface {
  readonly payload: SurePayload<NoteContent>
  readonly previousEntry?: HistoryEntryInterface
  itemFromPayload(): ItemInterface
  isSameAsEntry(entry: HistoryEntryInterface): boolean
  isDiscardable(): boolean
  operationVector(): number
  deltaSize(): number
}

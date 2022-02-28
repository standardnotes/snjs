import { UuidString } from '@Lib/types'
import { HistoryEntry } from './entries/history_entry'

export type HistoryMap = Record<UuidString, HistoryEntry[]>;

export const historyMapFunctions = {
  getNewestRevision: (history: HistoryEntry[]): HistoryEntry | undefined => {
    return history[0]
  },
}

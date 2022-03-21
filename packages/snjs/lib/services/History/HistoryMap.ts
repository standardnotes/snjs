import { UuidString } from "@Lib/Types/UuidString"
import { HistoryEntry } from './Entries/HistoryEntry'

export type HistoryMap = Record<UuidString, HistoryEntry[]>

export const historyMapFunctions = {
  getNewestRevision: (history: HistoryEntry[]): HistoryEntry | undefined => {
    return history[0]
  },
}

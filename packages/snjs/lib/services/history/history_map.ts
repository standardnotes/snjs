import { UuidString } from '@Lib/types';
import { HistoryEntry } from './entries/history_entry';

export type HistoryMap = Record<UuidString, HistoryEntry[]>;

export const historyMapFunctions = {
  getLatestEntry: (history: HistoryEntry[]): HistoryEntry => {
    return history[0];
  },
};

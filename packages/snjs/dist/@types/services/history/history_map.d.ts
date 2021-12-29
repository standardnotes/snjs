import { UuidString } from '../../types';
import { HistoryEntry } from './entries/history_entry';
export declare type HistoryMap = Record<UuidString, HistoryEntry[]>;
export declare const historyMapFunctions: {
    getNewestRevision: (history: HistoryEntry[]) => HistoryEntry | undefined;
};

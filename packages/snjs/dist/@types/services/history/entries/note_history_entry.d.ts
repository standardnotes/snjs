import { HistoryEntry } from './history_entry';
export declare class NoteHistoryEntry extends HistoryEntry {
    previewTitle(): string;
    previewSubTitle(): string;
    isDiscardable(): boolean;
}

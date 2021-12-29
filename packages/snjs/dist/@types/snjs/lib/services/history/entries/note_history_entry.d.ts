import { HistoryEntry } from '../../../../../services/history/entries/history_entry';
export declare class NoteHistoryEntry extends HistoryEntry {
    previewTitle(): string;
    previewSubTitle(): string;
    isDiscardable(): boolean;
}

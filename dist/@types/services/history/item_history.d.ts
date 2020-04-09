import { PurePayload } from '../../protocol/payloads/pure_payload';
import { ItemHistoryEntry } from './item_history_entry';
declare type ItemHistoryJson = {
    entries: any[];
};
export declare class ItemHistory {
    entries: ItemHistoryEntry[];
    constructor(entries?: ItemHistoryEntry[]);
    static FromJson(entryJson: ItemHistoryJson): ItemHistory;
    getLastEntry(): ItemHistoryEntry;
    addHistoryEntryForItem(payload: PurePayload): any;
    clear(): void;
    optimize(): void;
}
export {};

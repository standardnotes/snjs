import { PurePayload } from '../../../protocol/payloads/pure_payload';
import { ItemHistoryEntry } from '../entries/item_history_entry';
declare type ItemHistoryJson = {
    entries: ItemHistoryEntry[];
};
export declare class ItemSessionHistory {
    entries: ItemHistoryEntry[];
    constructor(entries?: ItemHistoryEntry[]);
    static FromJson(entryJson: ItemHistoryJson): ItemSessionHistory;
    getMostRecentEntry(): ItemHistoryEntry;
    addHistoryEntryForItem(payload: PurePayload): any;
    clear(): void;
    optimize(): void;
}
export {};

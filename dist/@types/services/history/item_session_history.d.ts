import { RawPayload } from './../../protocol/payloads/generator';
import { PurePayload } from '../../protocol/payloads/pure_payload';
import { ItemHistoryEntry } from './item_history_entry';
declare type ItemHistoryJson = {
    entries: RawPayload[];
};
export declare class ItemSessionHistory {
    entries: ItemHistoryEntry[];
    constructor(entries?: ItemHistoryEntry[]);
    static FromJson(entryJson: ItemHistoryJson): ItemSessionHistory;
    getLastEntry(): ItemHistoryEntry;
    addHistoryEntryForItem(payload: PurePayload): any;
    clear(): void;
    optimize(): void;
}
export {};

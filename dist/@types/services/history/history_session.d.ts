import { AnyRecord } from '../../types';
import { SNItem } from '../../models/core/item';
import { PurePayload } from '../../protocol/payloads/pure_payload';
import { ItemHistory } from './item_history';
/**
 * HistorySession is the only object in the session history domain that is
 * persistable. A history session contains one main content object: the
 * itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
 * and each value is an ItemHistory object.
 *
 * Each ItemHistory object contains an array called `entries` which contain
 * `ItemHistory` (or subclasses thereof) entries.
 */
declare type HistorySessionContent = {
    itemUUIDToItemHistoryMapping: Record<string, ItemHistory>;
};
export declare class HistorySession {
    private content?;
    private itemRevisionThreshold;
    constructor(content?: HistorySessionContent);
    static FromJson(historySessionJson?: AnyRecord): HistorySession;
    addEntryForPayload(payload: PurePayload): any;
    historyForItem(uuid: string): ItemHistory;
    clearItemHistory(item: SNItem): void;
    clearAllHistory(): void;
    setItemRevisionThreshold(threshold: number): void;
    optimizeHistoryForItem(uuid: string): void;
}
export {};

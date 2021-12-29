import { SNItem } from '../../../../../models/core/item';
import { SurePayload } from '../../../../../protocol/payloads/sure_payload';
export declare class HistoryEntry {
    readonly payload: SurePayload;
    readonly previousEntry?: HistoryEntry;
    protected readonly defaultContentKeyToDiffOn = "text";
    protected readonly textCharDiffLength: number;
    protected readonly hasPreviousEntry: boolean;
    constructor(payload: SurePayload, previousEntry?: HistoryEntry);
    itemFromPayload(): SNItem;
    isSameAsEntry(entry: HistoryEntry): boolean;
    isDiscardable(): boolean;
    operationVector(): number;
    deltaSize(): number;
}

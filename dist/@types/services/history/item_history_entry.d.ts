import { PurePayload } from '../../protocol/payloads/pure_payload';
export declare class ItemHistoryEntry {
    payload: PurePayload;
    /**
     * We'll assume a `text` content value to diff on.
     * If it doesn't exist, no problem.
     */
    protected defaultContentKeyToDiffOn: string;
    protected textCharDiffLength: number;
    protected hasPreviousEntry: boolean;
    constructor(payload: PurePayload);
    setPreviousEntry(previousEntry: ItemHistoryEntry): void;
    operationVector(): 1 | 0 | -1;
    deltaSize(): number;
    isSameAsEntry(entry: ItemHistoryEntry): boolean;
}

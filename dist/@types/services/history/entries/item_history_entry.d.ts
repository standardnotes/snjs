import { PurePayload } from '../../../protocol/payloads/pure_payload';
export declare enum ItemHistorySource {
    Session = "session",
    Remote = "remote"
}
export declare class ItemHistoryEntry {
    payload: PurePayload;
    /**
     * We'll assume a `text` content value to diff on.
     * If it doesn't exist, no problem.
     */
    protected defaultContentKeyToDiffOn: string;
    protected textCharDiffLength: number;
    protected hasPreviousEntry: boolean;
    protected readonly source: ItemHistorySource;
    constructor(payload: PurePayload, source: ItemHistorySource);
    setPreviousEntry(previousEntry: ItemHistoryEntry): void;
    operationVector(): 1 | -1 | 0;
    deltaSize(): number;
    isSameAsEntry(entry: ItemHistoryEntry): boolean;
    isRemoteSource(): boolean;
}

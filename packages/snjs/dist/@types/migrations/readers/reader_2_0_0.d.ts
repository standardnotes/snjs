import { StorageReader } from './reader';
export declare class StorageReader2_0_0 extends StorageReader {
    static version(): string;
    private getStorage;
    private getNonWrappedValue;
    /**
     * In 2.0.0+, account key params are stored in NonWrapped storage
     */
    getAccountKeyParams(): Promise<any>;
    hasNonWrappedAccountKeys(): Promise<boolean>;
    hasPasscode(): Promise<boolean>;
    usesKeychain(): boolean;
}

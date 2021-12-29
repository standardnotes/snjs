import { StorageReader } from './reader';
export declare class StorageReader1_0_0 extends StorageReader {
    static version(): string;
    getAccountKeyParams(): Promise<unknown>;
    /**
     * In 1.0.0, web uses raw storage for unwrapped account key, and mobile uses
     * the keychain
     */
    hasNonWrappedAccountKeys(): Promise<boolean>;
    hasPasscode(): Promise<boolean>;
    /** Keychain was not used on desktop/web in 1.0.0 */
    usesKeychain(): boolean;
}

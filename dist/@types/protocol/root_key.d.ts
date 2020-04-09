import { SNItem } from '../models/core/item';
import { ProtocolVersion } from './versions';
export declare type RootKeyContent = {
    version: ProtocolVersion;
    masterKey: string;
    serverPassword: string;
    dataAuthenticationKey?: string;
};
/**
 * A root key is a local only construct that houses the key used for the encryption
 * and decryption of items keys. A root key extends SNItem for local convenience, but is
 * not part of the syncing or storage ecosystem—root keys are managed independently.
 */
export declare class SNRootKey extends SNItem {
    static Create(content: RootKeyContent, uuid?: string): Promise<SNRootKey>;
    get version(): any;
    get isRootKey(): boolean;
    /**
     * When the root key is used to encrypt items, we use the masterKey directly.
     */
    get itemsKey(): any;
    get masterKey(): any;
    get serverPassword(): any;
    /** 003 and below only. */
    get dataAuthenticationKey(): any;
    /**
     * Compares two keys for equality
     */
    compare(otherKey: SNRootKey): boolean;
    /**
     * @returns Object containg key/values that should be extracted from key for local saving.
     */
    getPersistableValue(): any;
}

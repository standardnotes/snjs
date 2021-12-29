import { PurePayload } from './payloads/pure_payload';
import { AnyKeyParamsContent, SNRootKeyParams } from './key_params';
import { SNItem } from '../models/core/item';
import { ProtocolVersion } from './versions';
export declare type RootKeyContent = {
    version: ProtocolVersion;
    masterKey: string;
    serverPassword?: string;
    dataAuthenticationKey?: string;
    keyParams: AnyKeyParamsContent;
};
/**
 * A root key is a local only construct that houses the key used for the encryption
 * and decryption of items keys. A root key extends SNItem for local convenience, but is
 * not part of the syncing or storage ecosystem—root keys are managed independently.
 */
export declare class SNRootKey extends SNItem {
    readonly keyParams: SNRootKeyParams;
    static Create(content: RootKeyContent, uuid?: string): Promise<SNRootKey>;
    /**
     * Given a root key, expands its key params by making a copy which includes
     * the inputted key params. Used to expand locally created key params after signing in
     */
    static ExpandedCopy(key: SNRootKey, keyParams?: AnyKeyParamsContent): Promise<SNRootKey>;
    constructor(payload: PurePayload, keyParams: SNRootKeyParams);
    private get typedContent();
    get keyVersion(): any;
    get isRootKey(): boolean;
    /**
     * When the root key is used to encrypt items, we use the masterKey directly.
     */
    get itemsKey(): any;
    get masterKey(): any;
    /**
     * serverPassword is not persisted as part of keychainValue, so if loaded from disk,
     * this value may be undefined.
     */
    get serverPassword(): string | undefined;
    /** 003 and below only. */
    get dataAuthenticationKey(): any;
    /**
     * Compares two keys for equality
     */
    compare(otherKey: SNRootKey): boolean;
    /**
     * @returns Object suitable for persist in storage when wrapped
     */
    persistableValueWhenWrapping(): Partial<RootKeyContent>;
    /**
     * @returns Object that is suitable for persisting in a keychain
     */
    getKeychainValue(): Partial<RootKeyContent>;
}

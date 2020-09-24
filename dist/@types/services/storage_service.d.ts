import { ApplicationStage } from '../stages';
import { EncryptionDelegate } from './encryption_delegate';
import { SNRootKey } from '../protocol/root_key';
import { PurePayload } from '../protocol/payloads/pure_payload';
import { PureService } from './pure_service';
import { DeviceInterface } from '../device_interface';
export declare enum StoragePersistencePolicies {
    Default = 1,
    Ephemeral = 2
}
export declare enum StorageEncryptionPolicies {
    Default = 1,
    Disabled = 2
}
export declare enum StorageValueModes {
    /** Stored inside wrapped encrpyed storage object */
    Default = 1,
    /** Stored outside storage object, unencrypted */
    Nonwrapped = 2
}
export declare enum ValueModesKeys {
    Wrapped = "wrapped",
    Unwrapped = "unwrapped",
    Nonwrapped = "nonwrapped"
}
declare type ValuesObjectRecord = Record<string, any>;
export declare type StorageValuesObject = {
    [ValueModesKeys.Wrapped]: ValuesObjectRecord;
    [ValueModesKeys.Unwrapped]?: ValuesObjectRecord;
    [ValueModesKeys.Nonwrapped]: ValuesObjectRecord;
};
/**
 * The storage service is responsible for persistence of both simple key-values, and payload
 * storage. It does so by relying on deviceInterface to save and retrieve raw values and payloads.
 * For simple key/values, items are grouped together in an in-memory hash, and persisted to disk
 * as a single object (encrypted, when possible). It handles persisting payloads in the local
 * database by encrypting the payloads when possible.
 * The storage service also exposes methods that allow the application to initially
 * decrypt the persisted key/values, and also a method to determine whether a particular
 * key can decrypt wrapped storage.
 */
export declare class SNStorageService extends PureService {
    encryptionDelegate?: EncryptionDelegate;
    /** Wait until application has been unlocked before trying to persist */
    private storagePersistable;
    private persistencePolicy;
    private encryptionPolicy;
    private identifier;
    private needsPersist;
    private values;
    constructor(deviceInterface: DeviceInterface, identifier: string);
    deinit(): void;
    handleApplicationStage(stage: ApplicationStage): Promise<void>;
    setPersistencePolicy(persistencePolicy: StoragePersistencePolicies): Promise<void>;
    setEncryptionPolicy(encryptionPolicy: StorageEncryptionPolicies): Promise<void>;
    isEphemeralSession(): boolean;
    initializeFromDisk(): Promise<void>;
    /**
     * Called by platforms with the value they load from disk,
     * after they handle initializeFromDisk
     */
    private setInitialValues;
    isStorageWrapped(): boolean;
    canDecryptWithKey(key: SNRootKey): Promise<boolean>;
    private decryptWrappedValue;
    decryptStorage(): Promise<void>;
    /** @todo This function should be debounced. */
    private persistValuesToDisk;
    private immediatelyPersistValuesToDisk;
    /**
     * Generates a payload that can be persisted to disk,
     * either as a plain object, or an encrypted item.
     */
    private generatePersistableValues;
    setValue(key: string, value: any, mode?: StorageValueModes): Promise<void>;
    getValue(key: string, mode?: StorageValueModes, defaultValue?: any): Promise<any>;
    removeValue(key: string, mode?: StorageValueModes): Promise<void>;
    getStorageEncryptionPolicy(): StorageEncryptionPolicies;
    /**
     * Default persistence key. Platforms can override as needed.
     */
    private getPersistenceKey;
    private defaultValuesObject;
    static defaultValuesObject(wrapped?: ValuesObjectRecord, unwrapped?: ValuesObjectRecord, nonwrapped?: ValuesObjectRecord): StorageValuesObject;
    private domainKeyForMode;
    /**
     * Clears simple values from storage only. Does not affect payloads.
     */
    clearValues(): Promise<void>;
    getAllRawPayloads(): Promise<unknown[]>;
    savePayload(payload: PurePayload): Promise<void>;
    savePayloads(decryptedPayloads: PurePayload[]): Promise<void>;
    deletePayloads(payloads: PurePayload[]): Promise<void>;
    deletePayloadWithId(id: string): Promise<void>;
    clearAllPayloads(): Promise<void>;
    clearAllData(): Promise<void>;
}
export {};

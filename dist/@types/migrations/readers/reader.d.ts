import { ApplicationIdentifier } from './../../types';
import { Environment } from '../../platforms';
import { DeviceInterface } from '../../device_interface';
/**
 * A storage reader reads storage via a device interface
 * given a specific version of SNJS
 */
export declare abstract class StorageReader {
    protected deviceInterface: DeviceInterface;
    protected identifier: ApplicationIdentifier;
    protected environment: Environment;
    constructor(deviceInterface: DeviceInterface, identifier: ApplicationIdentifier, environment: Environment);
    static version(): string;
    abstract getAccountKeyParams(): Promise<unknown | undefined>;
    /**
     * Returns true if the state of storage has account keys present
     * in version-specific storage (either keychain or raw storage)
     */
    abstract hasNonWrappedAccountKeys(): Promise<boolean>;
    abstract hasPasscode(): Promise<boolean>;
    /** Whether this version used the keychain to store keys */
    abstract usesKeychain(): boolean;
}

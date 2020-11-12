import { ApplicationIdentifier } from './../../types';
import { Environment } from '@Lib/platforms';
import { DeviceInterface } from '@Lib/device_interface';

/**
 * A storage reader reads storage via a device interface
 * given a specific version of SNJS
 */

export abstract class StorageReader {

  constructor(
    protected deviceInterface: DeviceInterface,
    protected identifier: ApplicationIdentifier,
    protected environment: Environment
  ) {

  }

  public static version(): string {
    throw 'Must override';
  }

  public async abstract getAccountKeyParams(): Promise<unknown | undefined>;

  /**
   * Returns true if the state of storage has account keys present
   * in version-specific storage (either keychain or raw storage)
   */
  public async abstract hasNonWrappedAccountKeys(): Promise<boolean>;

  public async abstract hasPasscode(): Promise<boolean>;

  /** Whether this version used the keychain to store keys */
  public abstract usesKeychain(): boolean;
}
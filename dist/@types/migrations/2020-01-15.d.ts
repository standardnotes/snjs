import { SNRootKey } from './../protocol/root_key';
import { PurePayload } from '../protocol/payloads/pure_payload';
import { Migration } from './migration';
export declare class Migration20200115 extends Migration {
    static timestamp(): number;
    protected registerStageHandlers(): void;
    /**
     * Web
     * Migrates legacy storage structure into new managed format.
     * If encrypted storage exists, we need to first decrypt it with the passcode.
     * Then extract the account key from it. Then, encrypt storage with the
     * account key. Then encrypt the account key with the passcode and store it
     * within the new storage format.
     *
     * Generate note: We do not use the keychain if passcode is available.
     */
    private migrateStorageStructureForWebDesktop;
    /**
     * Helper
     * All platforms
     */
    private allPlatformHelperSetStorageStructure;
    /**
     * Helper
     * Web/desktop only
     */
    private webDesktopHelperGetPasscodeKeyAndDecryptEncryptedStorage;
    /**
     * Helper
     * Web/desktop only
     */
    private webDesktopHelperExtractAndWrapAccountKeysFromValueStore;
    /**
     * Helper
     * Web/desktop only
     * Encrypt storage with account key
     */
    webDesktopHelperEncryptStorage(key: SNRootKey, decryptedStoragePayload: PurePayload, storageValueStore: Record<string, any>): Promise<import("../protocol/payloads/generator").RawPayload>;
    /**
     * Mobile
     * On mobile legacy structure is mostly similar to new structure,
     * in that the account key is encrypted with the passcode. But mobile did
     * not have encrypted storage, so we simply need to transfer all existing
     * storage values into new managed structure.
     *
     * If no account but passcode only, the only thing we stored on mobile
     * previously was keys.offline.pw and keys.offline.timing in the keychain
     * that we compared against for valid decryption.
     * In the new version, we know a passcode is correct if it can decrypt storage.
     * As part of the migration, we’ll need to request the raw passcode from user,
     * compare it against the keychain offline.pw value, and if correct,
     * migrate storage to new structure, and encrypt with passcode key.
     *
     * If account only, take the value in the keychain, and rename the values
     * (i.e mk > masterKey).
     * @access private
     */
    migrateStorageStructureForMobile(): Promise<void>;
    /**
     * All platforms
     * Migrate all previously independently stored storage keys into new
     * managed approach. Also deletes any legacy values from raw storage.
     * @access private
     */
    migrateArbitraryRawStorageToManagedStorageAllPlatforms(): Promise<void>;
    /**
     * All platforms
     * Deletes all StorageKey and LegacyKeys from root raw storage.
     * @access private
     */
    deleteLegacyStorageValues(): Promise<void>;
    /**
     * All platforms
     * Migrate previously stored session string token into object
     * @access private
     */
    migrateSessionStorage(): Promise<void>;
    /**
     * All platforms
     * Create new default SNItemsKey from root key.
     * Otherwise, when data is loaded, we won't be able to decrypt it
     * without existence of an item key. This will mean that if this migration
     * is run on two different platforms for the same user, they will create
     * two new items keys. Which one they use to decrypt past items and encrypt
     * future items doesn't really matter.
     * @access private
     */
    createDefaultItemsKeyForAllPlatforms(): Promise<void>;
}

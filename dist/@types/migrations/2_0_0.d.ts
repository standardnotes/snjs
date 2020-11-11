import { SNRootKey } from './../protocol/root_key';
import { PurePayload } from '../protocol/payloads/pure_payload';
import { Migration } from './migration';
export declare class Migration2_0_0 extends Migration {
    static version(): string;
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
     * In version <= 3.0.16 on mobile, encrypted account keys were stored in the keychain
     * under `encryptedAccountKeys`. In 3.0.17 a migration was introduced that moved this value
     * to storage under key `encrypted_account_keys`. We need to anticipate the keys being in
     * either location.
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
     * If we are unable to determine a root key's version, due to missing version
     * parameter from key params due to 001 or 002, we need to fallback to checking
     * any encrypted payload and retrieving its version.
     *
     * If we are unable to garner any meaningful information, we will default to 002.
     *
     * (Previously we attempted to discern version based on presence of keys.ak; if ak,
     * then 003, otherwise 002. However, late versions of 002 also inluded an ak, so this
     * method can't be used. This method also didn't account for 001 versions.)
     */
    private getFallbackRootKeyVersion;
    /**
     * All platforms
     * Migrate all previously independently stored storage keys into new
     * managed approach.
     */
    private migrateArbitraryRawStorageToManagedStorageAllPlatforms;
    /**
     * All platforms
     * Deletes all StorageKey and LegacyKeys from root raw storage.
     * @access private
     */
    deleteLegacyStorageValues(): Promise<void>;
    /**
     * Mobile
     * Migrate mobile preferences
     */
    private migrateMobilePreferences;
    /**
     * All platforms
     * Migrate previously stored session string token into object
     * On mobile, JWTs were previously stored in storage, inside of the user object,
     * but then custom-migrated to be stored in the keychain. We must account for
     * both scenarios here in case a user did not perform the custom platform migration.
     * On desktop/web, JWT was stored in storage.
     */
    private migrateSessionStorage;
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

import { Migration } from './migration';
/**
 * The base migration always runs during app initialization. It is meant as a way
 * to set up all other migrations.
 */
export declare class BaseMigration extends Migration {
    private reader?;
    private didPreRun;
    preRun(): Promise<void>;
    protected registerStageHandlers(): void;
    private getStoredVersion;
    /**
     * In Snjs 1.x, and Snjs 2.0.0, version numbers were not stored (as they were introduced
     * in 2.0.1). Because migrations can now rely on this value, we want to establish a base
     * value if we do not find it in storage.
     */
    private storeVersionNumber;
    private loadReader;
    /**
     * If the keychain is empty, and the user does not have a passcode,
     * AND there appear to be stored account key params, this indicates
     * a launch where the keychain was wiped due to restoring device
     * from cloud backup which did not include keychain. This typically occurs
     * on mobile when restoring from iCloud, but we'll also follow this same behavior
     * on desktop/web as well, since we recently introduced keychain to desktop.
     *
     * We must prompt user for account password, and validate based on ability to decrypt
     * an item. We cannot validate based on storage because 1.x mobile applications did
     * not use encrypted storage, although we did on 2.x. But instead of having two methods
     * of validations best to use one that works on both.
     *
     * The item is randomly chosen, but for 2.x applications, it must be an items key item
     * (since only item keys are encrypted directly with account password)
     */
    needsKeychainRepair(): Promise<boolean>;
    private repairMissingKeychain;
}

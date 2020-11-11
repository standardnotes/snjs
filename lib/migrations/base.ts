import { PreviousSnjsVersion1_0_0, PreviousSnjsVersion2_0_0, SnjsVersion } from './../version';
import { Migration } from '@Lib/migrations/migration';
import { namespacedKey, RawStorageKey } from '@Lib/storage_keys';
import { ApplicationStage } from '@Lib/stages';
import { isNullOrUndefined } from '@Lib/utils';

/** A key that was briefly present in Snjs version 2.0.0 but removed in 2.0.1 */
const LastMigrationTimeStampKey2_0_0 = 'last_migration_timestamp';

export class BaseMigration extends Migration {

  protected registerStageHandlers() {
    this.registerStageHandler(ApplicationStage.PreparingForLaunch_0, async () => {
      await this.storeVersionNumber();
      this.markDone();
    });
  }

  /**
   * In Snjs 1.x, and Snjs 2.0.0, version numbers were not stored (as they were introduced
   * in 2.0.1). Because migrations can now rely on this value, we want to establish a base
   * value if we do not find it in storage.
   */
  private async storeVersionNumber() {
    const storageKey = namespacedKey(
      this.services.identifier,
      RawStorageKey.SnjsVersion
    );
    const version = await this.services.deviceInterface.getRawStorageValue(storageKey);
    if (!version) {
      /** Determine if we are 1.0.0 or 2.0.0 */
      /** If any of these keys exist in raw storage, we are coming from a 1.x architecture */
      const possibleLegacyKeys = [
        'migrations', 'ephemeral', 'user', 'cachedThemes', 'syncToken', 'encryptedStorage'
      ];
      let hasLegacyValue = false;
      for (const legacyKey of possibleLegacyKeys) {
        const value = await this.services.deviceInterface.getRawStorageValue(legacyKey);
        if (value) {
          hasLegacyValue = true;
          break;
        }
      }
      if (hasLegacyValue) {
        /** Coming from 1.0.0 */
        await this.services.deviceInterface.setRawStorageValue(
          storageKey,
          PreviousSnjsVersion1_0_0
        );
      } else {
        /** Coming from 2.0.0 (which did not store version) OR is brand new application */
        const migrationKey = namespacedKey(this.services!.identifier, LastMigrationTimeStampKey2_0_0);
        const migrationValue = await this.services.deviceInterface.getRawStorageValue(migrationKey);
        const is_2_0_0_application = !isNullOrUndefined(migrationValue);
        if (is_2_0_0_application) {
          await this.services.deviceInterface.setRawStorageValue(
            storageKey,
            PreviousSnjsVersion2_0_0
          );
        } else {
          /** Is new application, use current version as not to run any migrations */
          await this.services.deviceInterface.setRawStorageValue(
            storageKey,
            SnjsVersion
          );
        }
      }
    }
  }
}

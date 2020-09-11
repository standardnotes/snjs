import { Migration } from '@Lib/migrations/migration';
import { namespacedKey, RawStorageKey } from '@Lib/storage_keys';
import { ApplicationStage } from '@Lib/stages';
import { isNullOrUndefined } from '@Lib/utils';

export class BaseMigration extends Migration {

  public static timestamp() {
    return (new Date('2020-01-01').getTime());
  }

  protected registerStageHandlers() {
    this.registerStageHandler(ApplicationStage.PreparingForLaunch_0, async () => {
      await this.migrateMigrationTimestampAllPlatforms();
      this.markDone();
    });
  }

  /**
   * Establish last_migration_date.
   * We need to determine if this is a new application download,
   * or if we're coming from an older, non-current client.
   *
   * If new application download, we expect last_migration_date
   * to be null. However, last_migration_date can also be null if you
   * haven't yet migration to using this system.
   *
   * So in addition to this date being null, we check if deviceInterface
   * has pre-existing storage values for old migration system.
   * If so, this means this is a legacy client making its first jump to
   * this new migration system.
   */
  private async migrateMigrationTimestampAllPlatforms() {
    /** If any of these keys exist in raw storage, we are coming from a previous application version */
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
    const newKey = namespacedKey(this.services!.identifier, RawStorageKey.LastMigrationTimestamp);
    const lastDate = await this.services.deviceInterface.getRawStorageValue(newKey);
    const hasNewStructure = !isNullOrUndefined(lastDate);
    if (!hasNewStructure && hasLegacyValue) {
      /**
       * Old client updating for the first time. We need to run all migrations.
       * Set last migration date as epoch.
       */
      const newLastMigrationDate = new Date(0).getTime();
      await this.services.deviceInterface.setRawStorageValue(newKey, newLastMigrationDate);
    }
    else if (!hasNewStructure && !hasLegacyValue) {
      /** New application, dont run any migrations. Set last migration date as now. */
      const newLastMigrationDate = new Date().getTime();
      await this.services.deviceInterface.setRawStorageValue(newKey, newLastMigrationDate);
    }
    else if (hasNewStructure) {
      /** Application which has already performed base migration. Keep date as is. */
    }
  }
}

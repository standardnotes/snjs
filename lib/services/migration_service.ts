import { SyncEvent } from '@Services/sync/events';
import { ApplicationEvent } from './../events';
import { ApplicationStage } from '@Lib/stages';
import { MigrationServices } from './../migrations/types';
import { Migration } from '@Lib/migrations/migration';
import * as migrationImports from '@Lib/migrations';
import { BaseMigration } from '@Lib/migrations/2020-01-01-base';
import { PureService } from '@Services/pure_service';
import { namespacedKey, RawStorageKey } from '@Lib/storage_keys';
import { isNullOrUndefined, lastElement } from '@Lib/utils';

/**
 * The migration service orchestrates the execution of multi-stage migrations.
 * Migrations are registered during initial application launch, and listen for application
 * life-cycle events, and act accordingly. Migrations operate on the app-level, and not global level.
 * For example, a single migration may perform a unique set of steps when the application
 * first launches, and also other steps after the application is unlocked, or after the
 * first sync completes. Migrations live under /migrations and inherit from the base Migration class.
 */
export class SNMigrationService extends PureService {
  private activeMigrations?: Migration[]
  private handledFullSyncStage = false

  constructor(
    private services: MigrationServices
  ) {
    super();
  }

  public deinit() {
    (this.services as any) = undefined;
    if (this.activeMigrations) {
      this.activeMigrations.length = 0;
    }
    super.deinit();
  }

  public async initialize() {
    await this.runBaseMigration();
    this.activeMigrations = await this.getRequiredMigrations();
    if (this.activeMigrations.length > 0) {
      const lastMigration = lastElement(this.activeMigrations) as Migration;
      lastMigration.onDone(async () => {
        await this.saveLastMigrationTimestamp(
          (lastMigration.constructor as any).timestamp()
        );
      });
    }
  }

  /**
   * Application instances will call this function directly when they arrive
   * at a certain migratory state.
   */
  public async handleApplicationStage(stage: ApplicationStage) {
    await super.handleApplicationStage(stage);
    await this.handleStage(stage);
  }

  /**
   * Called by application
   */
  public async handleApplicationEvent(event: ApplicationEvent) {
    if (event === ApplicationEvent.SignedIn) {
      await this.handleStage(ApplicationStage.SignedIn_30);
    }
    else if (event === ApplicationEvent.CompletedFullSync) {
      if(!this.handledFullSyncStage) {
        this.handledFullSyncStage = true;
        await this.handleStage(ApplicationStage.FullSyncCompleted_13);
      }
    }
  }

  private async runBaseMigration() {
    const baseMigration = new BaseMigration(this.services);
    await baseMigration.handleStage(
      ApplicationStage.PreparingForLaunch_0
    );
  }

  public async hasPendingMigrations() {
    return (await this.getRequiredMigrations()).length > 0;
  }

  private async getRequiredMigrations() {
    const lastMigrationTimestamp = await this.getLastMigrationTimestamp();
    const activeMigrations = [];
    const migrationClasses = Object.keys(migrationImports).map((key) => {
      return (migrationImports as any)[key];
    }).sort((a, b) => {
      const aTimestamp = a.timestamp();
      const bTimestamp = b.timestamp();
      if (aTimestamp < bTimestamp) {
        return -1;
      } else if (aTimestamp > bTimestamp) {
        return 1;
      } else {
        return 0;
      }
    });
    for (const migrationClass of migrationClasses) {
      const migrationTimestamp = migrationClass.timestamp();
      if (migrationTimestamp > lastMigrationTimestamp) {
        // eslint-disable-next-line new-cap
        activeMigrations.push(new migrationClass(this.services));
      }
    }
    return activeMigrations;
  }

  private getNamespacedTimeStampKey() {
    return namespacedKey(
      this.services.identifier,
      RawStorageKey.LastMigrationTimestamp
    );
  }

  private async getLastMigrationTimestamp() {
    const timestamp = await this.services.deviceInterface.getRawStorageValue(
      this.getNamespacedTimeStampKey()
    );
    if (isNullOrUndefined(timestamp)) {
      throw 'Timestamp should not be null. Be sure to run base migration first.';
    }
    return JSON.parse(timestamp as any);
  }

  private async saveLastMigrationTimestamp(timestamp: number) {
    await this.services.deviceInterface.setRawStorageValue(
      this.getNamespacedTimeStampKey(),
      JSON.stringify(timestamp)
    );
  }

  private async handleStage(stage: ApplicationStage) {
    for (const migration of this.activeMigrations!) {
      await migration.handleStage(stage);
    }
  }
}

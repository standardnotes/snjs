import * as migrationImports from '@Lib/migration/migrations';
import { ApplicationEvents, ApplicationStages, SyncEvents } from '@Lib';
import { BaseMigration } from '@Lib/migration/migrations/2020-01-01-base';
import { PureService } from '@Services/pure_service';
import { namespacedKey, RAW_STORAGE_KEY_LAST_MIGRATION_TIMESTAMP } from '@Lib/storage_keys';
import { isNullOrUndefined, lastElement } from '@Lib/utils';

export class SNMigrationService extends PureService {

  constructor({application, challengeResponder}) {
    super();
    this.application = application;
    this.challengeResponder = challengeResponder;
  }

  async initialize() {
    await this.runBaseMigration();
    this.activeMigrations = await this.getRequiredMigrations();
    if(this.activeMigrations.length > 0) {
      const lastMigration = lastElement(this.activeMigrations);
      lastMigration.onDone(async () => {
        await this.saveLastMigrationTimestamp(
          lastMigration.constructor.timestamp()
        );
      });
    }
  }

  /**
  * @access public
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  async handleApplicationStage(stage) {
    await super.handleApplicationStage(stage);
    if(stage === ApplicationStages.ReadyForLaunch_05) {
      this.addLoginObserver();
      this.addSyncObserver();
    }
    await this.handleStage(stage);
  }

  async runBaseMigration() {
    const baseMigration = new BaseMigration({
      application: this.application
    });
    await baseMigration.handleStage(
      ApplicationStages.PreparingForLaunch_0
    );
  }

  async getRequiredMigrations() {
    const lastMigrationTimestamp = await this.getLastMigrationTimestamp();
    const activeMigrations = [];
    const migrationClasses = Object.keys(migrationImports).map((key) => {
      return migrationImports[key];
    }).sort((a, b) => {
      const aTimestamp = a.timestamp();
      const bTimestamp = b.timestamp();
      if(aTimestamp < bTimestamp) {
        return -1;
      } else if(aTimestamp > bTimestamp) {
        return 1;
      } else {
        return 0;
      }
    });
    for(const migrationClass of migrationClasses) {
      const migrationTimestamp = migrationClass.timestamp();
      if(migrationTimestamp > lastMigrationTimestamp) {
        // eslint-disable-next-line new-cap
        activeMigrations.push(new migrationClass({
          application: this.application,
          challengeResponder: this.challengeResponder
        }));
      }
    }
    return activeMigrations;
  }

  getTimeStampKey() {
    return namespacedKey(this.application.namespace, RAW_STORAGE_KEY_LAST_MIGRATION_TIMESTAMP);
  }

  async getLastMigrationTimestamp() {
    const timestamp = await this.application.deviceInterface.getRawStorageValue(
      this.getTimeStampKey()
    );
    if(isNullOrUndefined(timestamp)) {
      throw 'Timestamp should not be null. Be sure to run base migration first.';
    }
    return JSON.parse(timestamp);
  }

  async saveLastMigrationTimestamp(timestamp) {
    await this.application.deviceInterface.setRawStorageValue(
      this.getTimeStampKey(),
      JSON.stringify(timestamp)
    );
  }

  /**
   * @access private
   */

  addLoginObserver() {
   this.application.addEventObserver(async (event, data) => {
     if(event === ApplicationEvents.SignedIn) {
       await this.handleStage(ApplicationStages.SignedIn_30);
     }
   });
  }

  addSyncObserver() {
   this.application.syncService.addEventObserver(async (event, data) => {
     if(event === SyncEvents.FullSyncCompleted) {
       await this.handleStage(ApplicationStages.FullSyncCompleted_13);
     }
   });
  }

  async handleStage(stage) {
    for(const migration of this.activeMigrations) {
      await migration.handleStage(stage);
    }
  }
}

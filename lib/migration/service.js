import * as stages from '@Lib/stages';
import * as migrationImports from '@Lib/migration/migrations';
import { PureService } from '@Lib/services/pure_service';
import { BaseMigration } from '@Lib/migration/migrations/2020-01-01-base';
import {
  APPLICATION_EVENT_DID_SIGN_IN
} from '@Lib/events';
import {
  RAW_STORAGE_KEY_LAST_MIGRATION_TIMESTAMP
} from '@Lib/storage_keys';
const STORAGE_KEY_COMPLETED_MIGRATIONS = 'completed_migrations';

export class MigrationService extends PureService {

  constructor({application}) {
    super();
    this.application = application;
  }

  async initialize() {
    await this.runBaseMigration();
    this.activeMigrations = await this.getRequiredMigrations();
    const timestamps = this.activeMigrations.map((migration) => {
      return migration.timestamp();
    })
    const latestTimestamp = Math.max.apply(Math, timestamps);
    await this.saveLastMigrationTimestamp(latestTimestamp);
  }

  /**
  * @public
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  async handleApplicationStage(stage) {
    await super.handleApplicationStage(stage);
    if(stage === stages.APPLICATION_STAGE_AFTER_SERVICES_INIT) {
      this.addLoginObserver();
      this.addSyncObserver();
    }
    await this.handleStage(stage);
  }

  async runBaseMigration() {
    await BaseMigration.handleStageAll({
      stage: stages.APPLICATION_STAGE_BEFORE_SERVICES_INIT,
      application: this.application,
      deviceInterface: this.application.deviceInterface
    });
  }

  async getRequiredMigrations() {
    const lastMigrationTimestamp = await this.getLastMigrationTimestamp();
    const activeMigrations = [];
    const migrationClasses = Object.keys(migrationImports).map((key) => {
      return migrationImports[key];
    });
    for(const migrationClass of migrationClasses) {
      const migrationTimestamp = migrationClass.timestamp();
      if(migrationTimestamp > lastMigrationTimestamp) {
        activeMigrations.push(migrationClass);
      }
    }
    return activeMigrations;
  }

  getTimeStampKey() {
    return `${this.application.namespace}-${RAW_STORAGE_KEY_LAST_MIGRATION_TIMESTAMP}`;
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
   * @private
   */

  addLoginObserver() {
   this.application.addEventObserver(async (event, data) => {
     if(event === APPLICATION_EVENT_DID_SIGN_IN) {
       await this.handleStage(stages.APPLICATION_STAGE_AFTER_SIGN_IN);
     }
   });
  }

  addSyncObserver() {
   this.application.syncManager.addEventObserver(async (event, data) => {
     if(event === SYNC_EVENT_FULL_SYNC_COMPLETED) {
       await this.handleStage(stages.APPLICATION_STAGE_AFTER_FIRST_SYNC);
     }
   });
  }

  async handleStage(stage) {
    for(const migrationClass of this.activeMigrations) {
      await migrationClass.handleStage({
        application: this.application,
        stage: stage,
        platform: this.application.platform,
        deviceInterface: this.application.deviceInterface
      })
    }
  }

}

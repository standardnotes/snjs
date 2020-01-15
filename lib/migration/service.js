import * as stages from '@Lib/migration/stages';
import * as migrations from '@Lib/migration/migrations';
import { BaseMigration } from '@Lib/migration/migrations/2020-01-01-base';
import {
  APPLICATION_EVENT_DID_SIGN_IN,
  APPLICATION_EVENT_DID_UNLOCK
} from '@Lib/events';
import {
  RAW_STORAGE_KEY_LAST_MIGRATION_DATE
} from '@Lib/storage_keys';

const STORAGE_KEY_COMPLETED_MIGRATIONS = 'completed_migrations';

export class MigrationService {

  constructor({application}) {
    this.application = application;
    this.addLoginObserver();
    this.addSyncObserver();
  }

  async initialize() {
    await this.runBaseMigration();
    this.activeMigrations = await this.getRequiredMigrations();
    await this.updateLastMigrationTimestamp();
  }

  async runBaseMigration() {
    await BaseMigration.handleStageAll({
      stage: stages.MIGRATION_STAGE_BEFORE_SERVICES_INIT,
      application: this.application,
      deviceInterface: this.application.deviceInterface
    });
  }

  async getRequiredMigrations() {
    const lastMigrationTimestamp = await this.getLastMigrationTimestamp();
    const activeMigrations = [];
    for(const migrationClass of migrations) {
      const migrationTimestamp = migrationClass.timestamp();
      if(migrationTimestamp > lastMigrationTimestamp) {
        activeMigrations.push(migrationClass);
      }
    }
    return activeMigrations;
  }

  async getLastMigrationTimestamp() {
    const timestamp = await this.application.deviceInterface.getRawStorageValue(
      RAW_STORAGE_KEY_LAST_MIGRATION_DATE
    );
    if(isNullOrUndefined(timestamp)) {
      throw 'Timestamp should not be null. Be sure to run base migration first.';
    }
    return timestamp;
  }

  async updateLastMigrationTimestamp() {
    const timestamp = new Date().getTime();
    await this.application.deviceInterface.setRawStorageValue(
      RAW_STORAGE_KEY_LAST_MIGRATION_DATE,
      timestamp
    );
  }

  /**
  * @public
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  async applicationAtStage(migrationStage) {
    await this.handleStage(migrationStage);
  }

  /**
   * @private
   */

  addLoginObserver() {
   this.application.addEventObserver({
     callback: async (event, data) => {
       if(event === APPLICATION_EVENT_DID_SIGN_IN) {
         await this.handleStage(stages.MIGRATION_STAGE_AFTER_SIGN_IN);
       }
     }
   })
  }

  addSyncObserver() {
   this.application.syncManager.addEventObserver({
     callback: async (event, data) => {
       if(event === SYNC_EVENT_FULL_SYNC_COMPLETED) {
         await this.handleStage(stages.MIGRATION_STAGE_AFTER_FIRST_SYNC);
       }
     }
   })
  }

  async handleStage({stage}) {
    for(const migrationClass of this.activeMigrations) {
      await migrationClass.handleStage({
        application: this.application,
        stage: stage,
        platform: application.platform,
        deviceInterface: this.application.deviceInterface
      })
    }
  }

}

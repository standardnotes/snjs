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

  constructor({application, challengeResponder}) {
    super();
    this.application = application;
    this.challengeResponder = challengeResponder;
  }

  async initialize() {
    await this.runBaseMigration();
    this.activeMigrations = await this.getRequiredMigrations();
    if(this.activeMigrations.length > 0) {
      const timestamps = this.activeMigrations.map((migration) => {
        return migration.constructor.timestamp();
      })
      const latestTimestamp = Math.max.apply(Math, timestamps);
      if(!isFinite(latestTimestamp)) {
        throw 'Latest timestamp is not valid';
      }
      await this.saveLastMigrationTimestamp(latestTimestamp);
    }
  }

  /**
  * @public
  * Application instances will call this function directly when they arrive
  * at a certain migratory state.
  */
  async handleApplicationStage(stage) {
    await super.handleApplicationStage(stage);
    if(stage === stages.APPLICATION_STAGE_05_READY_FOR_LAUNCH) {
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
      stages.APPLICATION_STAGE_0_PREPARING_FOR_LAUNCH
    );
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
        activeMigrations.push(new migrationClass({
          application: this.application,
          challengeResponder: this.challengeResponder
        }));
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
       await this.handleStage(stages.APPLICATION_STAGE_30_SIGNED_IN);
     }
   });
  }

  addSyncObserver() {
   this.application.syncManager.addEventObserver(async (event, data) => {
     if(event === SYNC_EVENT_FULL_SYNC_COMPLETED) {
       await this.handleStage(stages.APPLICATION_STAGE_13_FULL_SYNC_COMPLETED);
     }
   });
  }

  async handleStage(stage) {
    for(const migration of this.activeMigrations) {
      await migration.handleStage(stage);
    }
  }

}

import pull from 'lodash/pull';
import { SFAuthManager } from '@Services/authManager'

export class SFMigrationManager {

  constructor(modelManager, syncManager, storageManager, authManager) {
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.storageManager = storageManager;

    this.completionHandlers = [];

    this.loadMigrations();

    // The syncManager used to dispatch a param called 'initialSync' in the 'sync:completed' event
    // to let us know of the first sync completion after login.
    // however it was removed as it was deemed to be unreliable (returned wrong value when a single sync request repeats on completion for pagination)
    // We'll now use authManager's events instead
    let didReceiveSignInEvent = false;
    let signInHandler = authManager.addEventHandler((event) => {
      if(event == SFAuthManager.DidSignInEvent) {
        didReceiveSignInEvent = true;
      }
    })

    this.receivedLocalDataEvent = syncManager.initialDataLoaded();

    this.syncManager.addEventHandler(async (event, data) => {
      let dataLoadedEvent = event == "local-data-loaded";
      let syncCompleteEvent = event == "sync:completed";

      if(dataLoadedEvent || syncCompleteEvent) {
        if(dataLoadedEvent) {
          this.receivedLocalDataEvent = true;
        } else if(syncCompleteEvent) {
          this.receivedSyncCompletedEvent = true;
        }

        // We want to run pending migrations only after local data has been loaded, and a sync has been completed.
        if(this.receivedLocalDataEvent && this.receivedSyncCompletedEvent) {
          // Only perform these steps on the first succcessful sync after sign in
          if(didReceiveSignInEvent) {
            // Reset our collected state about sign in
            didReceiveSignInEvent = false;
            authManager.removeEventHandler(signInHandler);

            // If initial online sync, clear any completed migrations that occurred while offline,
            // so they can run again now that we have updated user items. Only clear migrations that
            // don't have `runOnlyOnce` set
            var completedList = (await this.getCompletedMigrations()).slice();
            for(var migrationName of completedList) {
              let migration = await this.migrationForEncodedName(migrationName);
              if(!migration.runOnlyOnce) {
                pull(this._completed, migrationName);
              }
            }
          }
          this.runPendingMigrations();
        }
      }
    })
  }

  addCompletionHandler(handler) {
    this.completionHandlers.push(handler);
  }

  removeCompletionHandler(handler) {
    pull(this.completionHandlers, handler);
  }

  async migrationForEncodedName(name) {
    let decoded = await this.decode(name);
    return this.migrations.find((migration) => {
      return migration.name == decoded;
    })
  }

  loadMigrations() {
    this.migrations = this.registeredMigrations();
  }

  registeredMigrations() {
    // Subclasses should return an array of migrations here.
    // Migrations should have a unique `name`, `content_type`,
    // and `handler`, which is a function that accepts an array of matching items to migration.
  }

  async runPendingMigrations() {
    var pending = await this.getPendingMigrations();

    // run in pre loop, keeping in mind that a migration may be run twice: when offline then again when signing in.
    // we need to reset the items to a new array.
    for(var migration of pending) {
      migration.items = [];
    }

    for(var item of this.modelManager.allNondummyItems) {
      for(var migration of pending) {
        if(item.content_type == migration.content_type) {
          migration.items.push(item);
        }
      }
    }

    for(var migration of pending) {
      if((migration.items && migration.items.length > 0) || migration.customHandler) {
        await this.runMigration(migration, migration.items);
      } else {
        this.markMigrationCompleted(migration);
      }
    }

    for(var handler of this.completionHandlers) {
      handler();
    }
  }

  async encode(text) {
    return window.btoa(text);
  }

  async decode(text) {
    return window.atob(text);
  }

  async getCompletedMigrations() {
    if(!this._completed) {
      var rawCompleted = await this.storageManager.getItem("migrations");
      if(rawCompleted) {
        this._completed = JSON.parse(rawCompleted);
      } else {
        this._completed = [];
      }
    }
    return this._completed;
  }

  async getPendingMigrations() {
    var completed = await this.getCompletedMigrations();
    let pending = [];
    for(var migration of this.migrations) {
      // if the name is not found in completed, then it is pending.
      if(completed.indexOf(await this.encode(migration.name)) == -1) {
        pending.push(migration);
      }
    }
    return pending;
  }

  async markMigrationCompleted(migration) {
    var completed = await this.getCompletedMigrations();
    completed.push(await this.encode(migration.name));
    this.storageManager.setItem("migrations", JSON.stringify(completed));
    migration.running = false;
  }

  async runMigration(migration, items) {
    // To protect against running more than once, especially if it's a long-running migration,
    // we'll add this flag, and clear it on completion.
    if(migration.running) {
      return;
    }

    console.log("Running migration:", migration.name);

    migration.running = true;
    if(migration.customHandler) {
      return migration.customHandler().then(() => {
        this.markMigrationCompleted(migration);
      })
    } else {
      return migration.handler(items).then(() => {
        this.markMigrationCompleted(migration);
      })
    }
  }
}

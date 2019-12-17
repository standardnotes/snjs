import '../dist/regenerator.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('migrations', () => {
  var email = Factory.globalCryptoManager().crypto.generateUUIDSync();
  var password = Factory.globalCryptoManager().crypto.generateUUIDSync();

  before((done) => {
    Factory.globalStorageManager().clearAllData().then(() => {
      Factory.newRegisteredUser(email, password).then((user) => {
        done();
      })
    })
  })

  it("should not run migrations until local data loading and sync is complete", async () => {
    let authManager = Factory.globalAuthManager();
    let modelManager = Factory.createModelManager();
    modelManager.addItem(Factory.createItem());
    let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());

    syncManager.setKeyRequestHandler(async () => {
      return {
        keys: await authManager.keys(),
        auth_params: await authManager.getAuthParams(),
        offline: false
      };
    })

    var migrationManager = new SFMigrationManager(modelManager, syncManager, Factory.globalStorageManager(), authManager);

    migrationManager.registeredMigrations = () => {
      return [
        {
          name: "migration-1",
          content_type: "Note",
          handler: async (items) => {
            for(var item of items) {
              item.content.foo = "bar";
            }
          }
        }
      ]
    }

    var item = modelManager.allItems[0];
    expect(item.content.foo).to.not.equal("bar");

    migrationManager.loadMigrations();

    await syncManager.sync();
    var pending = await migrationManager.getPendingMigrations();
    var completed = await migrationManager.getCompletedMigrations();
    expect(pending.length).to.equal(1);
    expect(completed.length).to.equal(0);

    await syncManager.loadLocalItems();
    await syncManager.sync();
    // should be completed now
    // migrationManager works on event obsesrver, so will be asyncrounous. We'll wait a tiny bit here
    await Factory.sleep(0.3);
    var pending = await migrationManager.getPendingMigrations();
    var completed = await migrationManager.getCompletedMigrations();
    expect(pending.length).to.equal(0);
    expect(completed.length).to.equal(1);

    var item = modelManager.allItems[0];
    expect(item.content.foo).to.equal("bar");
  })

  it("should handle running multiple migrations", async () => {
    let authManager = Factory.globalAuthManager();
    let modelManager = Factory.createModelManager();
    modelManager.addItem(Factory.createItem());
    let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());

    syncManager.setKeyRequestHandler(async () => {
      return {
        keys: await authManager.keys(),
        auth_params: await authManager.getAuthParams(),
        offline: false
      };
    })

    await syncManager.loadLocalItems();

    var migrationManager = new SFMigrationManager(modelManager, syncManager, Factory.globalStorageManager(), authManager);

    let randValue1 = Math.random();
    let randValue2 = Math.random();
    migrationManager.registeredMigrations = () => {
      return [
        {
          name: "migration-2",
          content_type: "Note",
          handler: async (items) => {
            for(var item of items) {
              item.content.bar = randValue1;
            }
          }
        },
        {
          name: "migration-3",
          content_type: "Note",
          handler: async (items) => {
            for(var item of items) {
              item.content.foo = randValue2;
            }
          }
        },
      ]
    }

    return new Promise(async (resolve, reject) => {
      migrationManager.addCompletionHandler(() => {
        expect(item.content.bar).to.equal(randValue1);
        expect(item.content.foo).to.equal(randValue2);
        resolve();
      })

      migrationManager.loadMigrations();

      var item = modelManager.allItems[0];
      expect(item.content.bar).to.not.equal(randValue1);
      expect(item.content.foo).to.not.equal(randValue2);

      await syncManager.loadLocalItems();
      await syncManager.sync();
    })
  })

  it("should run migrations while offline, then again after signing in", async () => {
    // go offline
    let authManager = Factory.globalAuthManager();
    await Factory.globalStorageManager().clearAllData();
    await Factory.globalStorageManager().setItem("server", Factory.serverURL());
    let modelManager = Factory.createModelManager();
    let syncManager = new SFSyncManager(modelManager, Factory.globalStorageManager(), Factory.globalHttpManager());

    var migrationManager = new SFMigrationManager(modelManager, syncManager, Factory.globalStorageManager(), authManager);

    var params1 = Factory.createItem();
    modelManager.addItem(params1);

    let randValue = Math.random();
    migrationManager.registeredMigrations = () => {
      return [
        {
          name: "migration-1",
          content_type: "Note",
          handler: async (items) => {
            for(var item of items) {
              item.content.foo = randValue;
            }
          }
        }
      ]
    }

    syncManager.setKeyRequestHandler(async () => {
      return {
        offline: true
      };
    })

    migrationManager.loadMigrations();

    await syncManager.sync();
    var pending = await migrationManager.getPendingMigrations();
    var completed = await migrationManager.getCompletedMigrations();
    expect(pending.length).to.equal(1);
    expect(completed.length).to.equal(0);

    await syncManager.loadLocalItems();
    await syncManager.sync();
    // should be completed now
    // migrationManager works on event obsesrver, so will be asyncrounous. We'll wait a tiny bit here
    await Factory.sleep(0.1);
    var pending = await migrationManager.getPendingMigrations();
    var completed = await migrationManager.getCompletedMigrations();
    expect(pending.length).to.equal(0);
    expect(completed.length).to.equal(1);

    var item1 = modelManager.findItem(params1.uuid);
    expect(item1.content.foo).to.equal(randValue);

    var params = Factory.createItem();
    modelManager.addItem(params);
    var item = modelManager.findItem(params.uuid);
    expect(item.content.foo).to.not.equal(randValue);

    // sign in, migrations should run again
    var email = Factory.globalCryptoManager().crypto.generateUUIDSync();
    var password = Factory.globalCryptoManager().crypto.generateUUIDSync();
    await Factory.newRegisteredUser(email, password);
    authManager.notifyEvent(SFAuthManager.DidSignInEvent);

    syncManager.setKeyRequestHandler(async () => {
      return {
        keys: await authManager.keys(),
        auth_params: await authManager.getAuthParams(),
        offline: false
      };
    })

    await syncManager.sync();
    // migrations run asyncronously
    await Factory.sleep(0.1);
    var item = modelManager.findItem(params.uuid);
    expect(item.content.foo).to.equal(randValue);
  })

});

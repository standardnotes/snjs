import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('migrations', () => {
  var email = SFItem.GenerateUuidSynchronously();
  var password = SFItem.GenerateUuidSynchronously();

  before((done) => {
    Factory.globalStorageManager().clearAllData().then(() => {
      Factory.registerUserToApplication({email, password, application}).then((user) => {
        done();
      })
    })
  })

  it("should not run migrations until local data loading and sync is complete", async () => {
    let sessionManager = Factory.globalSessionManager();
    let modelManager = Factory.createModelManager();
    modelManager.addItem(Factory.createStorageItemNotePayload);
    const syncManager = new SNSyncManager({
      modelManager,
      sessionManager,
      storageManager: Factory.globalStorageManager(),
      protocolService: Factory.globalProtocolService(),
      httpManager: Factory.globalHttpManager()
    });

    var migrationService = new SNMigrationService(modelManager, syncManager, Factory.globalStorageManager(), sessionManager);

    migrationService.registeredMigrations = () => {
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

    migrationService.loadMigrations();

    await syncManager.sync();
    var pending = await migrationService.getPendingMigrations();
    var completed = await migrationService.getCompletedMigrations();
    expect(pending.length).to.equal(1);
    expect(completed.length).to.equal(0);

    await syncManager.loadDataFromDatabase();
    await syncManager.sync();
    // should be completed now
    // migrationService works on event obsesrver, so will be asyncrounous. We'll wait a tiny bit here
    await Factory.sleep(0.3);
    var pending = await migrationService.getPendingMigrations();
    var completed = await migrationService.getCompletedMigrations();
    expect(pending.length).to.equal(0);
    expect(completed.length).to.equal(1);

    var item = modelManager.allItems[0];
    expect(item.content.foo).to.equal("bar");
  })

  it("should handle running multiple migrations", async () => {
    let sessionManager = Factory.globalSessionManager();
    let modelManager = Factory.createModelManager();
    modelManager.addItem(Factory.createStorageItemNotePayload);
    const syncManager = new SNSyncManager({
      modelManager,
      sessionManager,
      storageManager: Factory.globalStorageManager(),
      protocolService: Factory.globalProtocolService(),
      httpManager: Factory.globalHttpManager()
    });

    await syncManager.loadDataFromDatabase();

    var migrationService = new SNMigrationService(modelManager, syncManager, Factory.globalStorageManager(), sessionManager);

    let randValue1 = Math.random();
    let randValue2 = Math.random();
    migrationService.registeredMigrations = () => {
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
      migrationService.addCompletionHandler(() => {
        expect(item.content.bar).to.equal(randValue1);
        expect(item.content.foo).to.equal(randValue2);
        resolve();
      })

      migrationService.loadMigrations();

      var item = modelManager.allItems[0];
      expect(item.content.bar).to.not.equal(randValue1);
      expect(item.content.foo).to.not.equal(randValue2);

      await syncManager.loadDataFromDatabase();
      await syncManager.sync();
    })
  })

  it("should run migrations while offline, then again after signing in", async () => {
    // go offline
    let sessionManager = Factory.globalSessionManager();
    await Factory.globalStorageManager().clearAllData();
    await Factory.globalStorageManager().setValue("server", Factory.serverURL());
    let modelManager = Factory.createModelManager();
    const syncManager = new SNSyncManager({
      modelManager,
      sessionManager,
      storageManager: Factory.globalStorageManager(),
      protocolService: Factory.globalProtocolService(),
      httpManager: Factory.globalHttpManager()
    });

    var migrationService = new SNMigrationService(modelManager, syncManager, Factory.globalStorageManager(), sessionManager);

    var params1 = Factory.createStorageItemNotePayload();
    modelManager.addItem(params1);

    let randValue = Math.random();
    migrationService.registeredMigrations = () => {
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

    migrationService.loadMigrations();

    await syncManager.sync();
    var pending = await migrationService.getPendingMigrations();
    var completed = await migrationService.getCompletedMigrations();
    expect(pending.length).to.equal(1);
    expect(completed.length).to.equal(0);

    await syncManager.loadDataFromDatabase();
    await syncManager.sync();
    // should be completed now
    // migrationService works on event obsesrver, so will be asyncrounous. We'll wait a tiny bit here
    await Factory.sleep(0.1);
    var pending = await migrationService.getPendingMigrations();
    var completed = await migrationService.getCompletedMigrations();
    expect(pending.length).to.equal(0);
    expect(completed.length).to.equal(1);

    var item1 = modelManager.findItem(params1.uuid);
    expect(item1.content.foo).to.equal(randValue);

    var params = Factory.createStorageItemNotePayload();
    modelManager.addItem(params);
    var item = modelManager.findItem(params.uuid);
    expect(item.content.foo).to.not.equal(randValue);

    // sign in, migrations should run again
    var email = SFItem.GenerateUuidSynchronously();
    var password = SFItem.GenerateUuidSynchronously();
    await Factory.registerUserToApplication({email, password, application});
    sessionManager.notifyEvent(APPLICATION_EVENT_DID_SIGN_IN);

    await syncManager.sync();
    // migrations run asyncronously
    await Factory.sleep(0.1);
    var item = modelManager.findItem(params.uuid);
    expect(item.content.foo).to.equal(randValue);
  })

});

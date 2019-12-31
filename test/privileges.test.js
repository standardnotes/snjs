import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
import MemoryStorageManager from './lib/memoryStorageManager.js';

SFItem.AppDomain = "org.standardnotes.sn";

chai.use(chaiAsPromised);
var expect = chai.expect;

const storageManager = Factory.createMemoryStorageManager();
const modelManager = new SNModelManager();
const syncManager = new SNSyncManager({
  modelManager,
  authManager: Factory.globalAuthManager(),
  storageManager: storageManager,
  protocolManager: Factory.globalProtocolManager(),
  httpManager: Factory.globalHttpManager()
});
const singletonManager = new SNSingletonManager(modelManager, syncManager);

let privilegesManager = new SFPrivilegesManager(modelManager, syncManager, singletonManager);
privilegesManager.setDelegate({
  isOffline: async () => {
    return false;
  },
  hasLocalPasscode: async () => {
    return true;
  },
  saveToStorage: async (key, value) => {
    return storageManager.setValue(key, value);
  },
  getFromStorage: async (key) => {
    return storageManager.getValue(key)
  },
  verifyAccountPassword: async () => {
    return true;
  },
  verifyLocalPasscode: async () => {
    return true;
  }
});

describe("privileges", () => {
  it("loads default actions and credentials", async () => {
    expect(privilegesManager.getAvailableActions().length).to.be.above(0);
    expect(privilegesManager.getAvailableCredentials().length).to.be.above(0);
  });

  it('successfully loads privileges', async () => {
    await syncManager.loadLocalItems();
    // Singleton handler doesn't run on initial data load, only after first sync
    await syncManager.sync();

    let privileges = await privilegesManager.getPrivileges();
    expect(privileges).to.be.ok;
  });

  it("adds credentials for actions", async () => {
    let privileges = await privilegesManager.getPrivileges();
    privileges.addCredentialForAction(SFPrivilegesManager.ActionViewProtectedNotes, SFPrivilegesManager.CredentialLocalPasscode);
    let credentials = await privilegesManager.netCredentialsForAction(SFPrivilegesManager.ActionViewProtectedNotes);
    expect(credentials.length).to.equal(1);
    let requiresCredentials = await privilegesManager.actionRequiresPrivilege(SFPrivilegesManager.ActionViewProtectedNotes);
    expect(requiresCredentials).to.equal(true);
  });

  it("handles session length", async () => {
    await privilegesManager.setSessionLength(SFPrivilegesManager.SessionLengthFiveMinutes);
    let length = await privilegesManager.getSelectedSessionLength();

    expect(length).to.equal(SFPrivilegesManager.SessionLengthFiveMinutes);

    let expirey = await privilegesManager.getSessionExpirey();
    expect(expirey).to.be.ok;
  });
})

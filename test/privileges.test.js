/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe("privileges", () => {

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function() {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.privilegesManager = this.application.privilegesManager;
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it("loads default actions and credentials", async function () {
    expect(this.privilegesManager.getAvailableActions().length).to.be.above(0);
    expect(this.privilegesManager.getAvailableCredentials().length).to.be.above(0);
  });

  it('successfully loads privileges', async function () {
    const privileges = await this.privilegesManager.getPrivileges();
    expect(privileges).to.be.ok;
  });

  it("adds credentials for actions", async function () {
    const privileges = await this.privilegesManager.getPrivileges();
    privileges.addCredentialForAction(
      ProtectedActions.ViewProtectedNotes,
      PRIVILEGE_CREDENTIAL_LOCAL_PASSCODE
    );
    await this.application.setPasscode('foobar');
    const credentials = await this.privilegesManager.netCredentialsForAction(
      ProtectedActions.ViewProtectedNotes
    );
    expect(credentials.length).to.equal(1);
    const requiresCredentials = await this.privilegesManager.actionRequiresPrivilege(
      ProtectedActions.ViewProtectedNotes
    );
    expect(requiresCredentials).to.equal(true);
  });

  it("handles session length", async function () {
    await this.privilegesManager.setSessionLength(
      PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES
    );
    const length = await this.privilegesManager.getSelectedSessionLength();
    expect(length).to.equal(PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES);
    const expirey = await this.privilegesManager.getSessionExpirey();
    expect(expirey).to.be.ok;
  });
})

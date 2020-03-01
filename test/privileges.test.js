/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('privileges', () => {

  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function() {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.privilegesService = this.application.privilegesService;
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  it('loads default actions and credentials', async function () {
    expect(this.privilegesService.getAvailableActions().length).to.be.above(0);
    expect(this.privilegesService.getAvailableCredentials().length).to.be.above(0);
  });

  it('successfully loads privileges', async function () {
    const privileges = await this.privilegesService.getPrivileges();
    expect(privileges).to.be.ok;
  });

  it('adds credentials for actions', async function () {
    const privileges = await this.privilegesService.getPrivileges();
    privileges.addCredentialForAction(
      ProtectedActions.ViewProtectedNotes,
      PrivilegeCredentials.LocalPasscode
    );
    await this.application.setPasscode('foobar');
    const credentials = await this.privilegesService.netCredentialsForAction(
      ProtectedActions.ViewProtectedNotes
    );
    expect(credentials.length).to.equal(1);
    const requiresCredentials = await this.privilegesService.actionRequiresPrivilege(
      ProtectedActions.ViewProtectedNotes
    );
    expect(requiresCredentials).to.equal(true);
  });

  it('handles session length', async function () {
    await this.privilegesService.setSessionLength(
      PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES
    );
    const length = await this.privilegesService.getSelectedSessionLength();
    expect(length).to.equal(PRIVILEGE_SESSION_LENGTH_FIVE_MINUTES);
    const expirey = await this.privilegesService.getSessionExpirey();
    expect(expirey).to.be.ok;
  });
})

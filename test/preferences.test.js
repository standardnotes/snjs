/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('preferences', function () {
  before(async function () {
    localStorage.clear();
  });

  after(async function () {
    localStorage.clear();
  });

  beforeEach(async function () {
    this.application = await Factory.createInitAppWithRandNamespace();
    this.email = Uuid.GenerateUuidSynchronously();
    this.password = Uuid.GenerateUuidSynchronously();
  });

  afterEach(async function () {
    await this.application.deinit();
  });

  function register() {
    return Factory.registerUserToApplication({
      application: this.application,
      email: this.email,
      password: this.password,
    });
  }

  it('saves preference', async function () {
    await register.call(this);
    await this.application.setPreference('editorLeft', 300);
    await this.application.sync();
    this.application = await Factory.signOutAndBackIn(
      this.application,
      this.email,
      this.password
    );
    const editorLeft = this.application.getPreference('editorLeft');
    expect(editorLeft).to.equal(300);
  });

  it('clears preferences on signout', async function () {
    await register.call(this);
    await this.application.setPreference('editorLeft', 300);
    await this.application.sync();
    this.application = await Factory.signOutApplicationAndReturnNew(
      this.application
    );
    expect(this.application.getPreference('editorLeft')).to.equal(undefined);
  });

  it('returns default value for non-existent preference', async function () {
    await register.call(this);
    const editorLeft = this.application.getPreference('editorLeft', 100);
    expect(editorLeft).to.equal(100);
  });

  it('emits an event when preferences change', async function () {
    let callTimes = 0;
    this.application.addEventObserver(() => {
      callTimes++;
    }, ApplicationEvent.PreferencesChanged);
    callTimes += 1;
    await Factory.sleep(0); /** Await next tick */
    expect(callTimes).to.equal(1); /** App start */
    await register.call(this);
    expect(callTimes).to.equal(2);
  });

  it('discards existing preferences when logging in', async function () {
    await register.call(this);
    await this.application.setPreference('editorLeft', 300);
    this.application = await Factory.signOutApplicationAndReturnNew(
      this.application
    );
    await this.application.setPreference('editorLeft', 200);
    await this.application.signIn(
      this.email,
      this.password,
      undefined,
      undefined,
      undefined,
      true
    );
    const editorLeft = this.application.getPreference('editorLeft');
    expect(editorLeft).to.equal(300);
  });
});

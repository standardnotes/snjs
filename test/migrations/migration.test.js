/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('migrations', () => {

  beforeEach(async () => {
    localStorage.clear();
  });

  afterEach(async () => {
    localStorage.clear();
  });

  it('version number is stored as string', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const version = await application.migrationService
      .getStoredSnjsVersion();
    expect(typeof version).to.equal('string');
    await application.deinit();
  });

  it('should return 1 required migrations if stored version is 1.0.0', async function () {
    expect((await SNMigrationService.getRequiredMigrations('1.0.0')).length).to.equal(1);
  });

  it('should return 0 required migrations if stored version is 2.0.0', async function () {
    expect((await SNMigrationService.getRequiredMigrations('2.0.0')).length).to.equal(0);
  });

  it('should return 0 required migrations if stored version is 2.0.1', async function () {
    expect((await SNMigrationService.getRequiredMigrations('2.0.1')).length).to.equal(0);
  });

  it('after running base migration, legacy structure should set version as 1.0.0', async function () {
    const application = await Factory.createAppWithRandNamespace();
    /** Set up 1.0.0 structure with tell-tale storage key */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    await application.migrationService.runBaseMigrationPreRun();
    expect(await application.migrationService.getStoredSnjsVersion()).to.equal('1.0.0');
    application.deinit();
  });

  it('after running base migration, 2.0.0 structure set version as 2.0.0', async function () {
    const application = await Factory.createAppWithRandNamespace();
    /** Set up 2.0.0 structure with tell-tale storage key */
    await application.deviceInterface.setRawStorageValue(
      namespacedKey(application.identifier, 'last_migration_timestamp'),
      'anything'
    );
    await application.migrationService.runBaseMigrationPreRun();
    expect(await application.migrationService.getStoredSnjsVersion()).to.equal('2.0.0');
    application.deinit();
  });

  it('after running base migration with no present storage values, should set version to current', async function () {
    const application = await Factory.createAppWithRandNamespace();
    await application.migrationService.runBaseMigrationPreRun();
    expect(await application.migrationService.getStoredSnjsVersion()).to.equal(SnjsVersion);
    application.deinit();
  });

  it('after running all migrations from a 1.0.0 installation, should set stored version to current', async function () {
    const application = await Factory.createAppWithRandNamespace();
    /** Set up 1.0.0 structure with tell-tale storage key */
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      JSON.stringify(['anything'])
    );
    await application.prepareForLaunch({
      receiveChallenge: () => { },
    });
    await application.launch(true);
    expect(await application.migrationService.getStoredSnjsVersion()).to.equal(SnjsVersion);
    application.deinit();
  });

  it('after running all migrations from a 2.0.0 installation, should set stored version to current', async function () {
    const application = await Factory.createAppWithRandNamespace();
    /** Set up 2.0.0 structure with tell-tale storage key */
    await application.deviceInterface.setRawStorageValue(
      'last_migration_timestamp',
      JSON.stringify(['anything'])
    );
    await application.prepareForLaunch({
      receiveChallenge: () => { },
    });
    await application.launch(true);
    expect(await application.migrationService.getStoredSnjsVersion()).to.equal(SnjsVersion);
    application.deinit();
  });

  it('should be 1 required migration coming from 1.0.0', async function () {
    const application = await Factory.createAppWithRandNamespace();
    await application.deviceInterface.setRawStorageValue(
      'migrations',
      'anything'
    );
    await application.migrationService.runBaseMigrationPreRun();
    expect(await application.migrationService.getStoredSnjsVersion()).to.equal('1.0.0');
    const pendingMigrations = await SNMigrationService.getRequiredMigrations(
      await application.migrationService.getStoredSnjsVersion()
    );
    expect(pendingMigrations.length).to.equal(1);
    expect(pendingMigrations[0].version()).to.equal('2.0.0');
    await application.prepareForLaunch({
      receiveChallenge: () => { },
    });
    await application.launch(true);
    expect(await application.migrationService.getStoredSnjsVersion()).to.equal(SnjsVersion);
    application.deinit();
  });

});

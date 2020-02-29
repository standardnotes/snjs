/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import '../../dist/snjs.js';
import '../../node_modules/chai/chai.js';
import '../vendor/chai-as-promised-built.js';
import Factory from '../lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('migrations', () => {

  before(async () => {
    localStorage.clear();
  });

  after(async () => {
    localStorage.clear();
  });

  it('migration timestamp should be a number', async function () {
    const timestamp = BaseMigration.timestamp();
    expect(typeof timestamp).to.equal('number');
  });

  it('last migration timestamp should be a number', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const timestamp = await application.migrationService
      .getLastMigrationTimestamp();
    expect(typeof timestamp).to.equal('number');
    await application.deinit();
  });

  it('should run base migration', async function () {
    const application = await Factory.createInitAppWithRandNamespace();
    const baseMigrationTimestamp = BaseMigration.timestamp();
    const lastMigrationTimestamp = await application.migrationService
      .getLastMigrationTimestamp();
    expect(lastMigrationTimestamp).to.be.above(baseMigrationTimestamp);
    await application.deinit();
  });

});

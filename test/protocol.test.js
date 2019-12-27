import '../node_modules/regenerator-runtime/runtime.js';
import '../dist/snjs.js';
import '../node_modules/chai/chai.js';
import './vendor/chai-as-promised-built.js';
import Factory from './lib/factory.js';

const sn_webprotocolManager = Factory.globalProtocolManager();

chai.use(chaiAsPromised);
var expect = chai.expect;

describe('protocol', () => {
  it('checks version to make sure its 004', () => {
    expect(sn_webprotocolManager.latestVersion()).to.equal("004");
  });

  it('checks supported versions to make sure it includes 001, 002, 003, 004', () => {
    expect(sn_webprotocolManager.supportedVersions()).to.eql(["001", "002", "003", "004"]);
  });

  it('cryptoweb should support costs greater than 5000', () => {
    expect(sn_webprotocolManager.supportsPasswordDerivationCost(5001)).to.equal(true);
  });

  it('version comparison of 002 should be older than library version', () => {
    expect(sn_webprotocolManager.isVersionNewerThanLibraryVersion("002")).to.equal(false);
  });

  it('version comparison of 005 should be newer than library version', () => {
    expect(sn_webprotocolManager.isVersionNewerThanLibraryVersion("005")).to.equal(true);
  });

  it('library version should not be outdated', () => {
    var currentVersion = sn_webprotocolManager.latestVersion();
    expect(sn_webprotocolManager.isProtocolVersionOutdated(currentVersion)).to.equal(false);
  });

  it('cost minimum for 003 to be 110,000', () => {
    var currentVersion = sn_webprotocolManager.latestVersion();
    expect(sn_webprotocolManager.costMinimumForVersion("003")).to.equal(110000);
  });
});

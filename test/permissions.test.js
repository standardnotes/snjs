/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('permissions', function () {
  beforeEach(async function () {
    localStorage.clear();
    this.application = await Factory.createInitAppWithRandNamespace();
    this.roles = [
      "USER",
    ];
    this.permissions = [
      "UNLIMITED_NOTE_HISTORY",
    ];
  });

  afterEach(async function () {
    await this.application.deinit();
    localStorage.clear();
  });

  describe('update', function () {
    it('updates roles and permissions and saves them in local storage', function () {
      this.application.permissionsService.update(this.roles, this.permissions);

      const storedRoles = this.application.storageService.getValue(StorageKey.UserRoles);
      expect(storedRoles.size).to.equal(1);
      expect(storedRoles.has(this.roles[0])).to.be.true;
  
      const storedPermissions = this.application.storageService.getValue(StorageKey.UserPermissions);
      console.log('stored', storedPermissions);
      expect(storedPermissions.size).to.equal(1);
      expect(storedPermissions.has(this.permissions[0])).to.be.true;
    });
  });

  describe('hasPermission', function () {
    it('returns true if user has permission', function () {
      this.application.permissionsService.update(this.roles, this.permissions);
      expect(this.application.hasPermission(this.permissions[0])).to.be.true;
    });

    it.only('returns false if user does not have permission', function () {
      const MISSING_PERMISSION = "EXTENDED_NOTE_HISTORY";
      this.application.permissionsService.update(this.roles, this.permissions);
      expect(this.application.hasPermission(MISSING_PERMISSION)).to.be.false;
    });
  });

  describe('setWebSocketUrl', function () {
    it('saves url in local storage', function () {
      const webSocketUrl = 'ws://test-websocket';
      this.application.permissionsService.setWebSocketUrl(webSocketUrl);
      
      const storedUrl = this.application.storageService.getValue(StorageKey.WebSocketUrl);
      expect(storedUrl).to.equal(webSocketUrl);
    }); 
  });
});

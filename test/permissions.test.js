/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
import { Uuid } from '../packages/snjs/dist/@types/uuid.js';
import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('permissions', async function () {
  beforeEach(async function () {
    localStorage.clear();
    this.application = await Factory.createInitAppWithRandNamespace();
    this.roles = [{
      uuid: await Uuid.GenerateUuid(),
      name: "USER",
    }],
    this.permissions = [{
      uuid: await Uuid.GenerateUuid(),
      name: "UNLIMITED_NOTE_HISTORY",
    }];
  });

  afterEach(async function () {
    await this.application.deinit();
    localStorage.clear();
  });

  describe('update', async function () {
    it('updates roles and permissions and saves them in local storage', async function () {
      await this.application.permissionsService.update(this.roles, this.permissions);

      const storedRoles = this.application.storageService.getValue(StorageKey.UserRoles);
      expect(storedRoles.length).to.equal(1);
      expect(storedRoles.some(r => r.name === this.roles[0].name)).to.be.true;
  
      const storedPermissions = this.application.storageService.getValue(StorageKey.UserPermissions);
      expect(storedPermissions.length).to.equal(1);
      expect(storedPermissions.some(p => p.name === this.permissions[0].name)).to.be.true;
    });
  });

  describe('hasPermission', function () {
    it('returns true if user has permission', async function () {
      await this.application.permissionsService.update(this.roles, this.permissions);
      expect(this.application.hasPermission(this.permissions[0].name)).to.be.true;
    });

    it('returns false if user does not have permission', function () {
      const MISSING_PERMISSION_NAME = "EXTENDED_NOTE_HISTORY";
      await this.application.permissionsService.update(this.roles, this.permissions);
      expect(this.application.hasPermission(MISSING_PERMISSION_NAME)).to.be.false;
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

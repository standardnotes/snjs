import {
  Platform,
  Environment,
  Uuid,
  DeinitSource,
  StorageKey
} from '@Lib/index';
import { createApplication } from '../factory';

describe('permissions', () => {
  let testSNApp;
  let roles, permissions;

  beforeEach(async () => {
    testSNApp = createApplication('test-application', Environment.Web, Platform.LinuxWeb);
    roles = [{
      uuid: Uuid.GenerateUuidSynchronously(),
      name: "USER",
    }];
    permissions = [{
      uuid: Uuid.GenerateUuidSynchronously(),
      name: "UNLIMITED_NOTE_HISTORY",
    }];
  });

  afterEach(() => {
    testSNApp.deinit(DeinitSource.SignOut);
  });

  describe('update()', () => {
    it('updates roles and permissions and saves them in local storage', async () => {
      await testSNApp.permissionsService.update(roles, permissions);

      const storedRoles = testSNApp.storageService.getValue(StorageKey.UserRoles);
      expect(storedRoles).toHaveLength(1);
      expect(storedRoles.some(r => r.name === roles[0].name)).toBe(true);

      const storedPermissions = testSNApp.storageService.getValue(StorageKey.UserPermissions);
      expect(storedPermissions).toHaveLength(1)
      expect(storedPermissions.some(p => p.name === permissions[0].name)).toBe(true);
    });
  });

  describe('hasPermission()', () => {
    it('returns true if user has permission', async () => {
      await testSNApp.permissionsService.update(roles, permissions);
      expect(testSNApp.hasPermission(permissions[0].name)).toBe(true);
    });

    it('returns false if user does not have permission', async () => {
      const MISSING_PERMISSION_NAME = "EXTENDED_NOTE_HISTORY";
      await testSNApp.permissionsService.update(roles, permissions);
      expect(testSNApp.hasPermission(MISSING_PERMISSION_NAME)).toBe(false);
    });
  });

  describe('setWebSocketUrl()', () => {
    it('saves url in local storage', () => {
      const webSocketUrl = 'ws://test-websocket';
      testSNApp.permissionsService.setWebSocketUrl(webSocketUrl);
      
      const storedUrl = testSNApp.storageService.getValue(StorageKey.WebSocketUrl);
      expect(storedUrl).toBe(webSocketUrl);
    }); 
  });
});

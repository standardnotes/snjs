import {
  Platform,
  Environment,
  Uuid,
  StorageKey
} from '@Lib/index';
import { Permission, Role } from '@standardnotes/auth';
import { createApplication } from '../factory';

describe('permissions', () => {
  let roles: Role[], permissions: Permission[];

  beforeEach(async () => {
    roles = [{
      uuid: Uuid.GenerateUuidSynchronously(),
      name: "USER",
    }];
    permissions = [{
      uuid: Uuid.GenerateUuidSynchronously(),
      name: "UNLIMITED_NOTE_HISTORY",
    }];
  });

  describe('update()', () => {
    it('updates roles and permissions and saves them in local storage', async () => {
      const application = createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      await application.permissionsService.update(roles, permissions);

      const storedRoles = application.storageService.getValue(StorageKey.UserRoles);
      expect(storedRoles).toHaveLength(1);
      expect(storedRoles.some(r => r.name === roles[0].name)).toBe(true);

      const storedPermissions = application.storageService.getValue(StorageKey.UserPermissions);
      expect(storedPermissions).toHaveLength(1)
      expect(storedPermissions.some(p => p.name === permissions[0].name)).toBe(true);
    });
  });

  describe('hasPermission()', () => {
    it('returns true if user has permission', async () => {
      const application = createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      await application.permissionsService.update(roles, permissions);
      expect(application.hasPermission(permissions[0].name)).toBe(true);
    });

    it('returns false if user does not have permission', async () => {
      const application = createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      const MISSING_PERMISSION_NAME = "EXTENDED_NOTE_HISTORY";
      await application.permissionsService.update(roles, permissions);
      expect(application.hasPermission(MISSING_PERMISSION_NAME)).toBe(false);
    });
  });

  describe('setWebSocketUrl()', () => {
    it('saves url in local storage', () => {
      const application = createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      const webSocketUrl = 'ws://test-websocket';
      application.permissionsService.setWebSocketUrl(webSocketUrl);
      
      const storedUrl = application.storageService.getValue(StorageKey.WebSocketUrl);
      expect(storedUrl).toBe(webSocketUrl);
    }); 
  });
});

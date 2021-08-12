import {
  Platform,
  Environment,
  StorageKey,
  DeinitSource
} from '@Lib/index';
import { Permission, Role } from '@standardnotes/auth';
import { createInitAppWithRandNamespace, generateUuid } from '../factory';

describe('permissions', () => {
  let roles: Role[], permissions: Permission[];

  beforeEach(async () => {
    roles = [{
      uuid: generateUuid(),
      name: "USER",
    }];
    permissions = [{
      uuid: generateUuid(),
      name: "UNLIMITED_NOTE_HISTORY",
    }];
  });

  describe('update()', () => {
    it('updates roles and permissions and saves them in local storage', async () => {
      const application = await createInitAppWithRandNamespace(Environment.Web, Platform.LinuxWeb);
      await application.permissionsService.update(roles, permissions);

      const storedRoles = application.storageService.getValue(StorageKey.UserRoles);
      expect(storedRoles).toHaveLength(1);
      expect(storedRoles.some(r => r.name === roles[0].name)).toBe(true);

      const storedPermissions = application.storageService.getValue(StorageKey.UserPermissions);
      expect(storedPermissions).toHaveLength(1)
      expect(storedPermissions.some(p => p.name === permissions[0].name)).toBe(true);
      application.deinit(DeinitSource.SignOut);
    });
  });

  describe('hasPermission()', () => {
    it('returns true if user has permission', async () => {
      const application = await createInitAppWithRandNamespace(Environment.Web, Platform.LinuxWeb);
      await application.permissionsService.update(roles, permissions);
      expect(application.hasPermission(permissions[0].name)).toBe(true);
      application.deinit(DeinitSource.SignOut);
    });

    it('returns false if user does not have permission', async () => {
      const application = await createInitAppWithRandNamespace(Environment.Web, Platform.LinuxWeb);
      const MISSING_PERMISSION_NAME = "EXTENDED_NOTE_HISTORY";
      await application.permissionsService.update(roles, permissions);
      expect(application.hasPermission(MISSING_PERMISSION_NAME)).toBe(false);
      application.deinit(DeinitSource.SignOut);
    });
  });

  describe('setWebSocketUrl()', () => {
    it('saves url in local storage', async () => {
      const application = await createInitAppWithRandNamespace(Environment.Web, Platform.LinuxWeb);
      const webSocketUrl = 'ws://test-websocket';
      application.permissionsService.setWebSocketUrl(webSocketUrl);
      
      const storedUrl = application.storageService.getValue(StorageKey.WebSocketUrl);
      expect(storedUrl).toBe(webSocketUrl);
      application.deinit(DeinitSource.SignOut);
    }); 
  });
});

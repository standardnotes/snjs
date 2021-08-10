import {
  StorageKey,
  SNStorageService,
  Uuid
} from '@Lib/index';
import { SNFeaturesService } from '@Lib/services/features_service';
import { Role, RoleName } from '@standardnotes/auth';

describe('featuresService', () => {
  let storageService: SNStorageService;
  let webSocketUrl = '';
  let roles: Role[];

  const createService = () => {
    return new SNFeaturesService(
      storageService,
      webSocketUrl,
    );
  };

  beforeEach(() => {
    roles = [{
      uuid: '1',
      name: RoleName.BasicUser,
    }];

    storageService = {} as jest.Mocked<SNStorageService>;
    storageService.setValue = jest.fn();
    storageService.getValue = jest.fn();
  });

  describe('loadUserRoles()', () => {
    it('retrieves user roles from storage', async () => {
      await createService().loadUserRoles();
      expect(storageService.getValue).toHaveBeenCalledWith(StorageKey.UserRoles);
    })
  })

  describe('updateRoles()', () => {  
    it('saves new roles to storage if they have changed', async () => {
      const newRoles = [
        ...roles,
        {
          uuid: '2',
          name: RoleName.CoreUser,
        }
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles(newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.UserRoles, newRoles);
    });

    it('does nothing if roles have not changed', async () => {
      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles(roles);
      expect(storageService.setValue).not.toHaveBeenCalled();
    });
  });

  describe('setWebSocketUrl()', () => {
    it('saves url in local storage', () => {
      const webSocketUrl = 'wss://test-websocket';
      createService().setWebSocketUrl(webSocketUrl);
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.WebSocketUrl, webSocketUrl);
    }); 
  });
});

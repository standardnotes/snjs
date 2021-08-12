import {
  StorageKey,
  SNStorageService,
  Uuid,
  SNApiService
} from '@Lib/index';
import { SNFeaturesService } from '@Lib/services/features_service';
import { Role, RoleName } from '@standardnotes/auth';

describe('featuresService', () => {
  let storageService: SNStorageService;
  let apiService: SNApiService;
  let webSocketUrl = '';
  let roles: RoleName[];

  const createService = () => {
    return new SNFeaturesService(
      storageService,
      apiService,
      webSocketUrl,
    );
  };

  beforeEach(() => {
    roles = [
      RoleName.BasicUser,
      RoleName.CoreUser,
    ];

    storageService = {} as jest.Mocked<SNStorageService>;
    storageService.setValue = jest.fn();
    storageService.getValue = jest.fn();

    apiService = {} as jest.Mocked<SNApiService>
    apiService.addEventObserver = jest.fn();
  });

  describe('loadUserRoles()', () => {
    it('retrieves user roles from storage', async () => {
      await createService().loadUserRoles();
      expect(storageService.getValue).toHaveBeenCalledWith(StorageKey.UserRoles);
    })
  })

  describe('updateRoles()', () => {  
    it('saves new roles to storage if a role has been added', async () => {
      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles(newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.UserRoles, newRoles);
    });

    it('saves new roles to storage if a role has been removed', async () => {
      const newRoles = [
        RoleName.BasicUser,
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

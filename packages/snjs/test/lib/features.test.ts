import {
  StorageKey,
  SNStorageService,
  Uuid,
  SNApiService,
  ItemManager,
  SNItem
} from '@Lib/index';
import { SNFeaturesService } from '@Lib/services/features_service';
import { RoleName } from '@standardnotes/auth';
import { ContentType, Feature, FeatureIdentifier } from '@standardnotes/features';

describe('featuresService', () => {
  let storageService: SNStorageService;
  let apiService: SNApiService;
  let itemManager: ItemManager;
  let webSocketUrl = '';
  let roles: RoleName[];
  let features: Feature[];
  let items: SNItem[];

  const createService = () => {
    return new SNFeaturesService(
      storageService,
      apiService,
      itemManager,
      webSocketUrl,
    );
  };

  beforeEach(() => {
    roles = [
      RoleName.BasicUser,
      RoleName.CoreUser,
    ];

    features = [
      {
        identifier: FeatureIdentifier.MidnightTheme,
        contentType: ContentType.Theme,
        expiresAt: new Date(),
      }
    ] as jest.Mocked<Feature[]>;

    items = [] as jest.Mocked<SNItem[]>

    storageService = {} as jest.Mocked<SNStorageService>;
    storageService.setValue = jest.fn();
    storageService.getValue = jest.fn();

    apiService = {} as jest.Mocked<SNApiService>
    apiService.addEventObserver = jest.fn();
    apiService.getUserFeatures = jest.fn().mockReturnValue({
      data: {
        features,        
      }
    })

    itemManager = {} as jest.Mocked<ItemManager>
    itemManager.getItems = jest.fn().mockReturnValue(
      items
    )
    itemManager.createItem = jest.fn()
    itemManager.changeComponent = jest.fn()
    itemManager.setItemsToBeDeleted = jest.fn()
  });

  describe('loadUserRoles()', () => {
    it('retrieves user roles from storage', async () => {
      await createService().loadUserRoles();
      expect(storageService.getValue).toHaveBeenCalledWith(StorageKey.UserRoles);
    })
  })

  describe('updateRoles()', () => {  
    it('saves new roles to storage and fetches features if a role has been added', async () => {
      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles('123', newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.UserRoles, newRoles);
      expect(apiService.getUserFeatures).toHaveBeenCalledWith('123');
    });

    it('saves new roles to storage and fetches features if a role has been removed', async () => {
      const newRoles = [
        RoleName.BasicUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles('123', newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.UserRoles, newRoles);
      expect(apiService.getUserFeatures).toHaveBeenCalledWith('123');
    });

    it('creates items for non-expired features if they do not exist', async () => {
      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles('123', newRoles);
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Theme,
        {
          content_type: ContentType.Theme,
          content: expect.objectContaining({
            identifier: FeatureIdentifier.MidnightTheme,
          }),
          references: [],
        },
      );
    });

    it('deletes items for expired features', async () => {
      const existingItem = {
        uuid: '456',
        content: {
          package_info: {
            identifier: FeatureIdentifier.MidnightTheme,
          }
        }
      };

      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      const today = new Date();
      const yesterday = today.setDate(today.getDate() - 1);

      storageService.getValue = jest.fn().mockReturnValue(roles);
      itemManager.getItems = jest.fn().mockReturnValue([existingItem]);
      apiService.getUserFeatures = jest.fn().mockReturnValue({ 
        data: {
          features: [{
            ...features[0],
            expiresAt: yesterday,
          }] 
        }
      });

      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles('123', newRoles);
      expect(itemManager.setItemsToBeDeleted).toHaveBeenCalledWith(['456']);
    })

    it('does nothing if roles have not changed', async () => {
      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles('123', roles);
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

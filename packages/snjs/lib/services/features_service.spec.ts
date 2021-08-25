import { SettingName } from '@Lib/../../settings/dist';
import {
  StorageKey,
  SNStorageService,
  SNApiService,
  ItemManager,
  SNItem,
  SNComponentManager,
} from '@Lib/index';
import { FillItemContent } from '@Lib/models/functions';
import { PurePayload } from '@Lib/protocol/payloads';
import { SNFeaturesService } from '@Lib/services/features_service';
import { RoleName } from '@standardnotes/auth';
import { ContentType, FeatureDescription, FeatureIdentifier } from '@standardnotes/features';
import { SNWebSocketsService } from './api/websockets_service';
import { SNSettingsService } from './settings_service';

describe('featuresService', () => {
  let storageService: SNStorageService;
  let apiService: SNApiService;
  let itemManager: ItemManager;
  let componentManager: SNComponentManager;
  let webSocketsService: SNWebSocketsService;
  let settingsService: SNSettingsService;
  let roles: RoleName[];
  let features: FeatureDescription[];
  let items: SNItem[];

  const createService = () => {
    return new SNFeaturesService(
      storageService,
      apiService,
      itemManager,
      componentManager,
      webSocketsService,
      settingsService,
    );
  };

  beforeEach(() => {
    roles = [
      RoleName.BasicUser,
      RoleName.CoreUser,
    ];

    const now = new Date();
    const tomorrow = now.setDate(now.getDate() + 1);

    features = [
      {
        identifier: FeatureIdentifier.MidnightTheme,
        content_type: ContentType.Theme,
        expires_at: tomorrow,
      },
      {
        identifier: FeatureIdentifier.BoldEditor,
        content_type: ContentType.Component,
        expires_at: tomorrow,
      }
    ] as jest.Mocked<FeatureDescription[]>;

    items = [] as jest.Mocked<SNItem[]>;

    storageService = {} as jest.Mocked<SNStorageService>;
    storageService.setValue = jest.fn();
    storageService.getValue = jest.fn();

    apiService = {} as jest.Mocked<SNApiService>;
    apiService.addEventObserver = jest.fn();
    apiService.getUserFeatures = jest.fn().mockReturnValue({
      data: {
        features,
      }
    });

    itemManager = {} as jest.Mocked<ItemManager>;
    itemManager.getItems = jest.fn().mockReturnValue(
      items
    );
    itemManager.createItem = jest.fn();
    itemManager.changeComponent = jest.fn();
    itemManager.setItemsToBeDeleted = jest.fn();
    itemManager.addObserver = jest.fn();

    componentManager = {} as jest.Mocked<SNComponentManager>;
    componentManager.setReadonlyStateForComponent = jest.fn();

    webSocketsService = {} as jest.Mocked<SNWebSocketsService>;
    webSocketsService.addEventObserver = jest.fn();

    settingsService = {} as jest.Mocked<SNSettingsService>;
    settingsService.updateSetting = jest.fn();
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
      expect(itemManager.createItem).toHaveBeenCalledTimes(2);
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Theme,
        expect.objectContaining({
          identifier: FeatureIdentifier.MidnightTheme,
        })
      );
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Component,
        expect.objectContaining({
          identifier: FeatureIdentifier.BoldEditor,
        })
      );
    });

    it('if item for a feature exists updates its content', async () => {
      const existingItem = {
        uuid: '789',
        safeContent: {
          package_info: {
            identifier: FeatureIdentifier.BoldEditor,
          }
        }
      };

      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      itemManager.getItems = jest.fn().mockReturnValue([existingItem]);
      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles('123', newRoles);

      expect(itemManager.changeComponent).toHaveBeenCalledWith(
        '789',
        expect.any(Function),
      );
    })

    it('creates items for expired components if they do not exist', async () => {
      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      const now = new Date();
      const yesterday = now.setDate(now.getDate() - 1);

      storageService.getValue = jest.fn().mockReturnValue(roles);
      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [{
            ...features[1],
            expiresAt: yesterday,
          }]
        }
      });

      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles('123', newRoles);
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Component,
        expect.objectContaining({
          identifier: FeatureIdentifier.BoldEditor,
        }),
      );
    });

    it('marks expired components as read-only', async () => {
      const existingItem = {
        uuid: '789',
        safeContent: {
          package_info: {
            identifier: FeatureIdentifier.BoldEditor,
          }
        }
      };

      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      const now = new Date();
      const yesterday = now.setDate(now.getDate() - 1);

      storageService.getValue = jest.fn().mockReturnValue(roles);
      itemManager.getItems = jest.fn().mockReturnValue([existingItem]);
      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [{
            ...features[1],
            expires_at: yesterday,
          }]
        }
      });

      const featuresService = createService();
      await featuresService.loadUserRoles();
      await featuresService.updateRoles('123', newRoles);
      expect(componentManager.setReadonlyStateForComponent).toHaveBeenCalledWith(existingItem, true);
    });

    it('deletes items for expired themes', async () => {
      const existingItem = {
        uuid: '456',
        safeContent: {
          package_info: {
            identifier: FeatureIdentifier.MidnightTheme,
          }
        }
      };

      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      const now = new Date();
      const yesterday = now.setDate(now.getDate() - 1);

      storageService.getValue = jest.fn().mockReturnValue(roles);
      itemManager.getItems = jest.fn().mockReturnValue([existingItem]);
      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [{
            ...features[0],
            expires_at: yesterday,
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

  describe('updateExtensionKeySetting', () => {
    it('should extract key from extension repo url and update user setting', async () => {
      const extensionKey = '129b029707e3470c94a8477a437f9394';
      const extensionRepoItem = FillItemContent({
        safeContent: {
          package_info: {
            url: `extensions.standardnotes.org/${extensionKey}`,
          },
        }
      }) as jest.Mocked<SNItem>;
      const featuresService = createService();
      await featuresService.updateExtensionKeySetting([extensionRepoItem]);
      expect(settingsService.updateSetting).toHaveBeenCalledWith(SettingName.ExtensionKey, extensionKey);
    });
  })
});

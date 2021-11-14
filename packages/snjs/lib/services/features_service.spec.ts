import { SNFeatureRepo } from './../models/app/feature_repo';
import { SNComponent } from '@Models/app/component';
import { SNSyncService } from './sync/sync_service';
import { SettingName } from '@standardnotes/settings';
import {
  ItemManager,
  SNAlertService,
  SNApiService,
  SNComponentManager,
  SNCredentialService,
  SNItem,
  SNSessionManager,
  SNStorageService,
  StorageKey
} from '@Lib/index';
import { SNFeaturesService } from '@Lib/services/features_service';
import { RoleName } from '@standardnotes/auth';
import { ContentType } from '@standardnotes/common';
import { FeatureDescription, FeatureIdentifier } from '@standardnotes/features';
import { SNWebSocketsService } from './api/websockets_service';
import { SNSettingsService } from './settings_service';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';

describe('featuresService', () => {
  let storageService: SNStorageService;
  let apiService: SNApiService;
  let itemManager: ItemManager;
  let componentManager: SNComponentManager;
  let webSocketsService: SNWebSocketsService;
  let settingsService: SNSettingsService;
  let credentialService: SNCredentialService;
  let syncService: SNSyncService;
  let alertService: SNAlertService;
  let sessionManager: SNSessionManager;
  let crypto: SNPureCrypto;
  let roles: RoleName[];
  let features: FeatureDescription[];
  let items: SNItem[];
  let now: Date;
  let tomorrow_server: number;
  let tomorrow_client: number;

  const createService = () => {
    return new SNFeaturesService(
      storageService,
      apiService,
      itemManager,
      componentManager,
      webSocketsService,
      settingsService,
      credentialService,
      syncService,
      alertService,
      sessionManager,
      crypto
    );
  };

  beforeEach(() => {
    roles = [
      RoleName.BasicUser,
      RoleName.CoreUser,
    ];

    now = new Date();
    tomorrow_client = now.setDate(now.getDate() + 1);
    tomorrow_server = tomorrow_client * 1_000;

    features = [
      {
        identifier: FeatureIdentifier.MidnightTheme,
        content_type: ContentType.Theme,
        expires_at: tomorrow_server,
      },
      {
        identifier: FeatureIdentifier.BoldEditor,
        content_type: ContentType.Component,
        expires_at: tomorrow_server,
      },
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
    apiService.downloadOfflineFeaturesFromRepo = jest.fn().mockReturnValue({
      features
    })
    apiService.isCustomServerHostUsed = jest.fn().mockReturnValue(false)

    itemManager = {} as jest.Mocked<ItemManager>;
    itemManager.getItems = jest.fn().mockReturnValue(
      items
    );
    itemManager.createItem = jest.fn();
    itemManager.changeComponent = jest.fn().mockReturnValue(
      {} as jest.Mocked<SNItem>
    )
    itemManager.setItemsToBeDeleted = jest.fn();
    itemManager.addObserver = jest.fn();
    itemManager.changeItem = jest.fn();
    itemManager.changeFeatureRepo = jest.fn();

    componentManager = {} as jest.Mocked<SNComponentManager>;
    componentManager.setReadonlyStateForComponent = jest.fn();

    webSocketsService = {} as jest.Mocked<SNWebSocketsService>;
    webSocketsService.addEventObserver = jest.fn();

    settingsService = {} as jest.Mocked<SNSettingsService>;
    settingsService.updateSetting = jest.fn();

    credentialService = {} as jest.Mocked<SNCredentialService>;
    credentialService.isSignedIn = jest.fn();
    credentialService.addEventObserver = jest.fn();

    syncService = {} as jest.Mocked<SNSyncService>;
    syncService.sync = jest.fn();

    alertService = {} as jest.Mocked<SNAlertService>;
    alertService.confirm = jest.fn();
    alertService.alert = jest.fn();

    sessionManager = {} as jest.Mocked<SNSessionManager>;
    sessionManager.getUser = jest.fn();

    crypto = {} as jest.Mocked<SNPureCrypto>
    crypto.base64Decode = jest.fn()
  });

  describe('loadUserRoles()', () => {
    it('retrieves user roles and features from storage', async () => {
      await createService().initializeFromDisk();
      expect(storageService.getValue).toHaveBeenCalledWith(StorageKey.UserRoles, undefined, []);
      expect(storageService.getValue).toHaveBeenCalledWith(StorageKey.UserFeatures, undefined, []);
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
      await featuresService.initializeFromDisk();
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
      await featuresService.initializeFromDisk();
      await featuresService.updateRoles('123', newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.UserRoles, newRoles);
      expect(apiService.getUserFeatures).toHaveBeenCalledWith('123');
    });


    it('saves features to storage when roles change', async () => {
      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRoles('123', newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(StorageKey.UserFeatures, features);
    })

    it('creates items for non-expired features with content type if they do not exist', async () => {
      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRoles('123', newRoles);
      expect(itemManager.createItem).toHaveBeenCalledTimes(2);
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Theme,
        expect.objectContaining({
          package_info: {
            content_type: ContentType.Theme,
            expires_at: tomorrow_client,
            identifier: FeatureIdentifier.MidnightTheme,
          }
        }),
        true
      );
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Component,
        expect.objectContaining({
          package_info: {
            content_type: ContentType.Component,
            expires_at: tomorrow_client,
            identifier: FeatureIdentifier.BoldEditor,
          }
        }),
        true
      );
    });

    it('if item for a feature exists updates its content', async () => {
      const existingItem = new SNComponent({
        uuid: '789',
        content_type: ContentType.Component,
        safeContent: {
          package_info: {
            identifier: FeatureIdentifier.BoldEditor,
            valid_until: new Date()
          }
        },
      } as never);

      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      itemManager.getItems = jest.fn().mockReturnValue([existingItem]);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
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
      const yesterday_client = now.setDate(now.getDate() - 1);
      const yesterday_server = yesterday_client * 1_000;

      storageService.getValue = jest.fn().mockReturnValue(roles);
      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [{
            ...features[1],
            expires_at: yesterday_server,
          }]
        }
      });

      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRoles('123', newRoles);
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Component,
        expect.objectContaining({
          package_info: {
            content_type: ContentType.Component,
            expires_at: yesterday_client,
            identifier: FeatureIdentifier.BoldEditor,
          }
        }),
        true
      );
    });

    it('marks expired components as read-only', async () => {
      const existingItem = new SNComponent({
        uuid: '789',
        content_type: ContentType.Component,
        safeContent: {
          package_info: {
            identifier: FeatureIdentifier.BoldEditor,
            valid_until: new Date()
          }
        },
      } as never);

      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      const now = new Date();
      const yesterday_client = now.setDate(now.getDate() - 1);
      const yesterday_server = yesterday_client * 1_000;

      itemManager.changeComponent = jest.fn().mockReturnValue(
        existingItem
      )
      storageService.getValue = jest.fn().mockReturnValue(roles);
      itemManager.getItems = jest.fn().mockReturnValue([existingItem]);
      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [{
            ...features[1],
            expires_at: yesterday_server,
          }]
        }
      });

      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRoles('123', newRoles);
      expect(componentManager.setReadonlyStateForComponent).toHaveBeenCalledWith(existingItem, true);
    });

    it('deletes items for expired themes', async () => {
      const existingItem = new SNComponent({
        uuid: '456',
        content_type: ContentType.Theme,
        safeContent: {
          package_info: {
            identifier: FeatureIdentifier.MidnightTheme,
            valid_until: new Date()
          }
        },
      } as never);

      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      const now = new Date();
      const yesterday = now.setDate(now.getDate() - 1);

      itemManager.changeComponent = jest.fn().mockReturnValue(
        existingItem
      )
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
      await featuresService.initializeFromDisk();
      await featuresService.updateRoles('123', newRoles);
      expect(itemManager.setItemsToBeDeleted).toHaveBeenCalledWith(['456']);
    });

    it('does not create an item for a feature without content type', async () => {
      const features = [
        {
          identifier: FeatureIdentifier.TagNesting,
          expires_at: tomorrow_server,
        }
      ];

      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features,
        },
      });

      const newRoles = [
        ...roles,
        RoleName.PlusUser,
      ];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRoles('123', newRoles);
      expect(itemManager.createItem).not.toHaveBeenCalled();
    });

    it('does nothing after initial update if roles have not changed', async () => {
      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRoles('123', roles);
      await featuresService.updateRoles('123', roles);
      await featuresService.updateRoles('123', roles);
      await featuresService.updateRoles('123', roles);
      expect(storageService.setValue).toHaveBeenCalledTimes(2);
    });
  });

  describe('migrateFeatureRepoToUserSetting', () => {
    it('should extract key from extension repo url and update user setting', async () => {
      const extensionKey = '129b029707e3470c94a8477a437f9394';
      const extensionRepoItem = new SNFeatureRepo({
        uuid: '456',
        content_type: ContentType.ExtensionRepo,
        safeContent: {
          url: `https://extensions.standardnotes.org/${extensionKey}`,
        },
      } as never)

      const featuresService = createService();
      await featuresService.migrateFeatureRepoToUserSetting([extensionRepoItem]);
      expect(settingsService.updateSetting).toHaveBeenCalledWith(SettingName.ExtensionKey, extensionKey, true);
    });
  })
});

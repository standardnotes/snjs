import { SNFeatureRepo } from './../models/app/feature_repo';
import { SNComponent } from '@Models/app/component';
import { SNSyncService } from './sync/sync_service';
import { SettingName } from '@standardnotes/settings';
import {
  ItemManager,
  SNAlertService,
  SNApiService,
  SNCredentialService,
  SNItem,
  SNSessionManager,
  SNStorageService,
  StorageKey,
} from '@Lib/index';
import {
  FeatureStatus,
  SNFeaturesService,
} from '@Lib/services/features_service';
import { ContentType, Runtime, RoleName } from '@standardnotes/common';
import {
  FeatureDescription,
  FeatureIdentifier,
  GetFeatures,
} from '@standardnotes/features';
import { SNWebSocketsService } from './api/websockets_service';
import { SNSettingsService } from './settings_service';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { convertTimestampToMilliseconds } from '@standardnotes/utils';

describe('featuresService', () => {
  let storageService: SNStorageService;
  let apiService: SNApiService;
  let itemManager: ItemManager;
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
  const expiredDate = new Date(new Date().getTime() - 1000).getTime();

  const createService = () => {
    return new SNFeaturesService(
      storageService,
      apiService,
      itemManager,
      webSocketsService,
      settingsService,
      credentialService,
      syncService,
      alertService,
      sessionManager,
      crypto,
      Runtime.Prod
    );
  };

  beforeEach(() => {
    roles = [RoleName.BasicUser, RoleName.CoreUser];

    now = new Date();
    tomorrow_client = now.setDate(now.getDate() + 1);
    tomorrow_server = convertTimestampToMilliseconds(tomorrow_client * 1_000);

    features = [
      {
        ...GetFeatures().find(
          (f) => f.identifier === FeatureIdentifier.MidnightTheme
        ),
        expires_at: tomorrow_server,
      },
      {
        ...GetFeatures().find(
          (f) => f.identifier === FeatureIdentifier.BoldEditor
        ),
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
      },
    });
    apiService.downloadOfflineFeaturesFromRepo = jest.fn().mockReturnValue({
      features,
    });
    apiService.isThirdPartyHostUsed = jest.fn().mockReturnValue(false);

    itemManager = {} as jest.Mocked<ItemManager>;
    itemManager.getItems = jest.fn().mockReturnValue(items);
    itemManager.createItem = jest.fn();
    itemManager.createTemplateItem = jest.fn().mockReturnValue({});
    itemManager.changeComponent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SNItem>);
    itemManager.setItemsToBeDeleted = jest.fn();
    itemManager.addObserver = jest.fn();
    itemManager.changeItem = jest.fn();
    itemManager.changeFeatureRepo = jest.fn();

    webSocketsService = {} as jest.Mocked<SNWebSocketsService>;
    webSocketsService.addEventObserver = jest.fn();

    settingsService = {} as jest.Mocked<SNSettingsService>;
    settingsService.updateSetting = jest.fn();

    credentialService = {} as jest.Mocked<SNCredentialService>;
    credentialService.addEventObserver = jest.fn();

    syncService = {} as jest.Mocked<SNSyncService>;
    syncService.sync = jest.fn();

    alertService = {} as jest.Mocked<SNAlertService>;
    alertService.confirm = jest.fn().mockReturnValue(true);
    alertService.alert = jest.fn();

    sessionManager = {} as jest.Mocked<SNSessionManager>;
    sessionManager.isSignedIntoFirstPartyServer = jest.fn();
    sessionManager.getUser = jest.fn();

    crypto = {} as jest.Mocked<SNPureCrypto>;
    crypto.base64Decode = jest.fn();
  });

  describe('loadUserRoles()', () => {
    it('retrieves user roles and features from storage', async () => {
      await createService().initializeFromDisk();
      expect(storageService.getValue).toHaveBeenCalledWith(
        StorageKey.UserRoles,
        undefined,
        []
      );
      expect(storageService.getValue).toHaveBeenCalledWith(
        StorageKey.UserFeatures,
        undefined,
        []
      );
    });
  });

  describe('updateRoles()', () => {
    it('saves new roles to storage and fetches features if a role has been added', async () => {
      const newRoles = [...roles, RoleName.PlusUser];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(
        StorageKey.UserRoles,
        newRoles
      );
      expect(apiService.getUserFeatures).toHaveBeenCalledWith('123');
    });

    it('saves new roles to storage and fetches features if a role has been removed', async () => {
      const newRoles = [RoleName.BasicUser];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(
        StorageKey.UserRoles,
        newRoles
      );
      expect(apiService.getUserFeatures).toHaveBeenCalledWith('123');
    });

    it('saves features to storage when roles change', async () => {
      const newRoles = [...roles, RoleName.PlusUser];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);
      expect(storageService.setValue).toHaveBeenCalledWith(
        StorageKey.UserFeatures,
        features
      );
    });

    it('creates items for non-expired features with content type if they do not exist', async () => {
      const newRoles = [...roles, RoleName.PlusUser];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);
      expect(itemManager.createItem).toHaveBeenCalledTimes(2);
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Theme,
        expect.objectContaining({
          package_info: expect.objectContaining({
            content_type: ContentType.Theme,
            expires_at: tomorrow_client,
            identifier: FeatureIdentifier.MidnightTheme,
          }),
        }),
        true
      );
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Component,
        expect.objectContaining({
          package_info: expect.objectContaining({
            content_type: ContentType.Component,
            expires_at: tomorrow_client,
            identifier: FeatureIdentifier.BoldEditor,
          }),
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
            valid_until: new Date(),
          },
        },
      } as never);

      const newRoles = [...roles, RoleName.PlusUser];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      itemManager.getItems = jest.fn().mockReturnValue([existingItem]);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);

      expect(itemManager.changeComponent).toHaveBeenCalledWith(
        '789',
        expect.any(Function)
      );
    });

    it('creates items for expired components if they do not exist', async () => {
      const newRoles = [...roles, RoleName.PlusUser];

      const now = new Date();
      const yesterday_client = now.setDate(now.getDate() - 1);
      const yesterday_server = yesterday_client * 1_000;

      storageService.getValue = jest.fn().mockReturnValue(roles);
      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [
            {
              ...features[1],
              expires_at: yesterday_server,
            },
          ],
        },
      });

      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);
      expect(itemManager.createItem).toHaveBeenCalledWith(
        ContentType.Component,
        expect.objectContaining({
          package_info: expect.objectContaining({
            content_type: ContentType.Component,
            expires_at: yesterday_client,
            identifier: FeatureIdentifier.BoldEditor,
          }),
        }),
        true
      );
    });

    it('deletes items for expired themes', async () => {
      const existingItem = new SNComponent({
        uuid: '456',
        content_type: ContentType.Theme,
        safeContent: {
          package_info: {
            identifier: FeatureIdentifier.MidnightTheme,
            valid_until: new Date(),
          },
        },
      } as never);

      const newRoles = [...roles, RoleName.PlusUser];

      const now = new Date();
      const yesterday = now.setDate(now.getDate() - 1);

      itemManager.changeComponent = jest.fn().mockReturnValue(existingItem);
      storageService.getValue = jest.fn().mockReturnValue(roles);
      itemManager.getItems = jest.fn().mockReturnValue([existingItem]);
      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [
            {
              ...features[0],
              expires_at: yesterday,
            },
          ],
        },
      });

      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);
      expect(itemManager.setItemsToBeDeleted).toHaveBeenCalledWith(['456']);
    });

    it('does not create an item for a feature without content type', async () => {
      const features = [
        {
          identifier: FeatureIdentifier.TagNesting,
          expires_at: tomorrow_server,
        },
      ];

      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features,
        },
      });

      const newRoles = [...roles, RoleName.PlusUser];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);
      expect(itemManager.createItem).not.toHaveBeenCalled();
    });

    it('does nothing after initial update if roles have not changed', async () => {
      storageService.getValue = jest.fn().mockReturnValue(roles);
      const featuresService = createService();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', roles);
      await featuresService.updateRolesAndFetchFeatures('123', roles);
      await featuresService.updateRolesAndFetchFeatures('123', roles);
      await featuresService.updateRolesAndFetchFeatures('123', roles);
      expect(storageService.setValue).toHaveBeenCalledTimes(2);
    });

    it('remote native features should be swapped with compiled version', async () => {
      const remoteFeature = {
        identifier: FeatureIdentifier.BoldEditor,
        content_type: ContentType.Component,
        expires_at: tomorrow_server,
        version: '1.0.0',
      } as FeatureDescription;

      const newRoles = [...roles, RoleName.PlusUser];

      storageService.getValue = jest.fn().mockReturnValue(roles);
      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [remoteFeature],
        },
      });

      const featuresService = createService();
      const nativeFeature = featuresService[
        'mapRemoteNativeFeatureToStaticFeature'
      ](remoteFeature);
      featuresService['mapNativeFeatureToItem'] = jest.fn();
      await featuresService.initializeFromDisk();
      await featuresService.updateRolesAndFetchFeatures('123', newRoles);
      expect(featuresService['mapNativeFeatureToItem']).toHaveBeenCalledWith(
        nativeFeature,
        expect.anything(),
        expect.anything()
      );
    });

    it('feature status', async () => {
      const featuresService = createService();

      features = [
        {
          identifier: FeatureIdentifier.MidnightTheme,
          content_type: ContentType.Theme,
          expires_at: tomorrow_server,
          role_name: RoleName.CoreUser,
        },
        {
          identifier: FeatureIdentifier.BoldEditor,
          content_type: ContentType.Component,
          expires_at: expiredDate,
          role_name: RoleName.PlusUser,
        },
      ] as jest.Mocked<FeatureDescription[]>;

      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features,
        },
      });

      sessionManager.isSignedIntoFirstPartyServer = jest
        .fn()
        .mockReturnValue(true);

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
        RoleName.CoreUser,
      ]);

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.Entitled);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.BoldEditor)
      ).toBe(FeatureStatus.NotInCurrentPlan);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.SheetsEditor)
      ).toBe(FeatureStatus.NotInCurrentPlan);

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
      ]);

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.NoUserSubscription);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.BoldEditor)
      ).toBe(FeatureStatus.NoUserSubscription);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.SheetsEditor)
      ).toBe(FeatureStatus.NoUserSubscription);

      features = [
        {
          identifier: FeatureIdentifier.MidnightTheme,
          content_type: ContentType.Theme,
          expires_at: expiredDate,
          role_name: RoleName.CoreUser,
        },
        {
          identifier: FeatureIdentifier.BoldEditor,
          content_type: ContentType.Component,
          expires_at: expiredDate,
          role_name: RoleName.PlusUser,
        },
      ] as jest.Mocked<FeatureDescription[]>;

      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features,
        },
      });

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
        RoleName.CoreUser,
      ]);

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.InCurrentPlanButExpired);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.BoldEditor)
      ).toBe(FeatureStatus.NotInCurrentPlan);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.SheetsEditor)
      ).toBe(FeatureStatus.NotInCurrentPlan);
    });

    it('third party feature status', async () => {
      const featuresService = createService();

      const themeFeature = {
        identifier: 'third-party-theme' as FeatureIdentifier,
        content_type: ContentType.Theme,
        expires_at: tomorrow_server,
        role_name: RoleName.CoreUser,
      };

      const editorFeature = {
        identifier: 'third-party-editor' as FeatureIdentifier,
        content_type: ContentType.Component,
        expires_at: expiredDate,
        role_name: RoleName.PlusUser,
      };

      features = [themeFeature, editorFeature] as jest.Mocked<
        FeatureDescription[]
      >;

      featuresService['features'] = features;

      Object.defineProperty(itemManager, 'components', {
        get: jest.fn(() => [
          new SNComponent({
            uuid: '123',
            content_type: ContentType.Theme,
            safeContent: {
              valid_until: themeFeature.expires_at,
              package_info: {
                ...themeFeature,
              },
            },
          } as never),
          new SNComponent({
            uuid: '456',
            content_type: ContentType.Component,
            safeContent: {
              valid_until: new Date(editorFeature.expires_at),
              package_info: {
                ...editorFeature,
              },
            },
          } as never),
        ]),
        set: jest.fn(),
      });

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
      ]);

      expect(featuresService.getFeatureStatus(themeFeature.identifier)).toBe(
        FeatureStatus.Entitled
      );
      expect(featuresService.getFeatureStatus(editorFeature.identifier)).toBe(
        FeatureStatus.InCurrentPlanButExpired
      );
      expect(
        featuresService.getFeatureStatus(
          'missing-feature-identifier' as FeatureIdentifier
        )
      ).toBe(FeatureStatus.NoUserSubscription);
    });

    it('feature status should be not entitled if no account or offline repo', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
      ]);

      sessionManager.isSignedIntoFirstPartyServer = jest
        .fn()
        .mockReturnValue(false);

      featuresService['completedSuccessfulFeaturesRetrieval'] = false;

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.NoUserSubscription);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.TokenVaultEditor)
      ).toBe(FeatureStatus.NoUserSubscription);
    });

    it('feature status should be entitled for subscriber until first successful features request made if no cached features', async () => {
      const featuresService = createService();

      apiService.getUserFeatures = jest.fn().mockReturnValue({
        data: {
          features: [],
        },
      });

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
        RoleName.PlusUser,
      ]);

      sessionManager.isSignedIntoFirstPartyServer = jest
        .fn()
        .mockReturnValue(true);

      featuresService['completedSuccessfulFeaturesRetrieval'] = false;

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.Entitled);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.TokenVaultEditor)
      ).toBe(FeatureStatus.Entitled);

      await featuresService.didDownloadFeatures(features);

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.Entitled);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.TokenVaultEditor)
      ).toBe(FeatureStatus.NotInCurrentPlan);
    });

    it('feature status should be dynamic for subscriber if cached features and no successful features request made yet', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
        RoleName.PlusUser,
      ]);

      featuresService['completedSuccessfulFeaturesRetrieval'] = false;

      sessionManager.isSignedIntoFirstPartyServer = jest
        .fn()
        .mockReturnValue(true);

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.Entitled);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.TokenVaultEditor)
      ).toBe(FeatureStatus.NotInCurrentPlan);

      featuresService['completedSuccessfulFeaturesRetrieval'] = false;

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.Entitled);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.TokenVaultEditor)
      ).toBe(FeatureStatus.NotInCurrentPlan);
    });

    it('feature status for offline subscription', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
        RoleName.PlusUser,
      ]);

      sessionManager.isSignedIntoFirstPartyServer = jest
        .fn()
        .mockReturnValue(false);
      featuresService['completedSuccessfulFeaturesRetrieval'] = true;

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.NoUserSubscription);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.TokenVaultEditor)
      ).toBe(FeatureStatus.NoUserSubscription);

      featuresService.hasOfflineRepo = jest.fn().mockReturnValue(true);

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.MidnightTheme)
      ).toBe(FeatureStatus.Entitled);
      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.TokenVaultEditor)
      ).toBe(FeatureStatus.NotInCurrentPlan);
    });

    it('feature status for deprecated feature', async () => {
      const featuresService = createService();

      sessionManager.isSignedIntoFirstPartyServer = jest
        .fn()
        .mockReturnValue(true);

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.DeprecatedFileSafe)
      ).toBe(FeatureStatus.NoUserSubscription);

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
        RoleName.CoreUser,
      ]);

      expect(
        featuresService.getFeatureStatus(FeatureIdentifier.DeprecatedFileSafe)
      ).toBe(FeatureStatus.Entitled);
    });

    it('has paid subscription', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
      ]);
      sessionManager.isSignedIntoFirstPartyServer = jest
        .fn()
        .mockReturnValue(true);

      expect(featuresService.hasPaidOnlineOrOfflineSubscription()).toBeFalsy;

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
        RoleName.PlusUser,
      ]);

      expect(featuresService.hasPaidOnlineOrOfflineSubscription()).toEqual(
        true
      );
    });

    it('has paid subscription should be true if offline repo and signed into third party server', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
      ]);

      featuresService.hasOfflineRepo = jest.fn().mockReturnValue(true);
      sessionManager.isSignedIntoFirstPartyServer = jest
        .fn()
        .mockReturnValue(false);

      expect(featuresService.hasPaidOnlineOrOfflineSubscription()).toEqual(
        true
      );
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
      } as never);

      const featuresService = createService();
      await featuresService.migrateFeatureRepoToUserSetting([
        extensionRepoItem,
      ]);
      expect(settingsService.updateSetting).toHaveBeenCalledWith(
        SettingName.ExtensionKey,
        extensionKey,
        true
      );
    });
  });

  describe('downloadExternalFeature', () => {
    it('should not allow if identifier matches native identifier', async () => {
      apiService.downloadFeatureUrl = jest.fn().mockReturnValue({
        data: {
          identifier: 'org.standardnotes.bold-editor',
          name: 'Bold Editor',
          content_type: 'SN|Component',
          area: 'editor-editor',
          version: '1.0.0',
          url: 'http://localhost:8005/',
        },
      });

      const installUrl = 'http://example.com';
      crypto.base64Decode = jest.fn().mockReturnValue(installUrl);

      const featuresService = createService();
      const result = await featuresService.validateAndDownloadExternalFeature(
        installUrl
      );
      expect(result).toBeUndefined();
    });

    it('should not allow if url matches native url', async () => {
      apiService.downloadFeatureUrl = jest.fn().mockReturnValue({
        data: {
          identifier: 'org.foo.bar',
          name: 'Bold Editor',
          content_type: 'SN|Component',
          area: 'editor-editor',
          version: '1.0.0',
          url: 'http://localhost:8005/org.standardnotes.bold-editor/index.html',
        },
      });

      const installUrl = 'http://example.com';
      crypto.base64Decode = jest.fn().mockReturnValue(installUrl);

      const featuresService = createService();
      const result = await featuresService.validateAndDownloadExternalFeature(
        installUrl
      );
      expect(result).toBeUndefined();
    });
  });

  describe('sortRolesByHierarchy', () => {
    it('should sort given roles according to role hierarchy', () => {
      const featuresService = createService();

      const sortedRoles = featuresService.rolesBySorting([
        RoleName.ProUser,
        RoleName.CoreUser,
        RoleName.BasicUser,
        RoleName.PlusUser,
      ]);

      expect(sortedRoles).toStrictEqual([
        RoleName.BasicUser,
        RoleName.CoreUser,
        RoleName.PlusUser,
        RoleName.ProUser,
      ]);
    });
  });

  describe('hasMinimumRole', () => {
    it('should be false if basic user checks for core role', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.BasicUser,
      ]);

      const hasCoreUserRole = featuresService.hasMinimumRole(RoleName.CoreUser);

      expect(hasCoreUserRole).toBe(false);
    });

    it('should be false if core user checks for plus role', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.CoreUser,
        RoleName.BasicUser,
      ]);

      const hasPlusUserRole = featuresService.hasMinimumRole(RoleName.PlusUser);

      expect(hasPlusUserRole).toBe(false);
    });

    it('should be false if plus user checks for pro role', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.PlusUser,
        RoleName.BasicUser,
      ]);

      const hasProUserRole = featuresService.hasMinimumRole(RoleName.ProUser);

      expect(hasProUserRole).toBe(false);
    });

    it('should be true if pro user checks for core user', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.ProUser,
        RoleName.BasicUser,
        RoleName.PlusUser,
      ]);

      const hasCoreUserRole = featuresService.hasMinimumRole(RoleName.CoreUser);

      expect(hasCoreUserRole).toBe(true);
    });

    it('should be true if pro user checks for pro user', async () => {
      const featuresService = createService();

      await featuresService.updateRolesAndFetchFeatures('123', [
        RoleName.ProUser,
        RoleName.BasicUser,
        RoleName.PlusUser,
      ]);

      const hasProUserRole = featuresService.hasMinimumRole(RoleName.ProUser);

      expect(hasProUserRole).toBe(true);
    });
  });
});

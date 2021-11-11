import { ApplicationStage } from '@Lib/stages';
import {
  LEGACY_PROD_EXT_ORIGIN,
  PROD_OFFLINE_FEATURES_URL,
} from './../constants';
import {
  SNFeatureRepo,
  FeatureRepoContent,
} from './../models/app/feature_repo';
import { SNSyncService } from './sync/sync_service';
import { AccountEvent, SNCredentialService } from './credential_service';
import { UserRolesChangedEvent } from '@standardnotes/domain-events';
import { StorageKey } from '@Lib/storage_keys';
import { PureService } from './pure_service';
import { SNStorageService } from './storage_service';
import { RoleName } from '@standardnotes/auth';
import {
  ApiServiceEvent,
  MetaReceivedData,
  SNApiService,
} from './api/api_service';
import { ErrorObject, UuidString } from '@Lib/types';
import { FeatureDescription, FeatureIdentifier } from '@standardnotes/features';
import { ContentType } from '@standardnotes/common';
import { ItemManager } from './item_manager';
import { UserFeaturesResponse } from './api/responses';
import { SNComponentManager } from './component_manager';
import { SNComponent } from '@Lib/models';
import {
  SNWebSocketsService,
  WebSocketsServiceEvent,
} from './api/websockets_service';
import { FillItemContent } from '@Lib/models/functions';
import { PayloadContent } from '@Lib/protocol';
import { ComponentContent } from '@Lib/models/app/component';
import { SNSettingsService } from './settings_service';
import { SettingName } from '@standardnotes/settings';
import { PayloadSource } from '@Payloads/sources';
import {
  arraysEqual,
  convertTimestampToMilliseconds,
  isErrorObject,
} from '@Lib/utils';
import { SNSessionManager } from '@Services/api/session_manager';
import {
  API_MESSAGE_FAILED_DOWNLOADING_EXTENSION,
  API_MESSAGE_FAILED_OFFLINE_ACTIVATION,
  API_MESSAGE_UNTRUSTED_EXTENSIONS_WARNING,
  INVALID_EXTENSION_URL,
} from '@Services/api/messages';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { ButtonType, SNAlertService } from '@Services/alert_service';
import {
  TRUSTED_CUSTOM_EXTENSIONS_HOSTS,
  TRUSTED_FEATURE_HOSTS,
} from '@Lib/constants';

export type SetOfflineFeaturesFunctionResponse = ErrorObject | undefined;
export type OfflineSubscriptionEntitlements = {
  featuresUrl: string;
  extensionKey: string;
};
type GetOfflineSubscriptionDetailsResponse =
  | OfflineSubscriptionEntitlements
  | ErrorObject;

export const enum FeaturesEvent {
  UserRolesChanged = 'UserRolesChanged',
}

export class SNFeaturesService extends PureService<FeaturesEvent> {
  private deinited = false;
  private roles: RoleName[] = [];
  private features: FeatureDescription[] = [];
  private removeApiServiceObserver: () => void;
  private removeWebSocketsServiceObserver: () => void;
  private removefeatureReposObserver: () => void;
  private removeSignInObserver: () => void;
  private initialFeaturesUpdateDone = false;

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private itemManager: ItemManager,
    private componentManager: SNComponentManager,
    private webSocketsService: SNWebSocketsService,
    private settingsService: SNSettingsService,
    private credentialService: SNCredentialService,
    private syncService: SNSyncService,
    private alertService: SNAlertService,
    private sessionManager: SNSessionManager,
    private crypto: SNPureCrypto
  ) {
    super();

    this.removeApiServiceObserver = apiService.addEventObserver(
      async (eventName, data) => {
        if (eventName === ApiServiceEvent.MetaReceived) {
          /**
           * All user data must be downloaded before we map features. Otherwise, feature mapping
           * may think a component doesn't exist and create a new one, when in reality the component
           * already exists but hasn't been downloaded yet.
           */
          if (!this.syncService.completedOnlineDownloadFirstSync) {
            return;
          }
          const { userUuid, userRoles } = data as MetaReceivedData;
          await this.updateRoles(
            userUuid,
            userRoles.map((role) => role.name)
          );
        }
      }
    );

    this.removeWebSocketsServiceObserver = webSocketsService.addEventObserver(
      async (eventName, data) => {
        if (eventName === WebSocketsServiceEvent.UserRoleMessageReceived) {
          const {
            payload: { userUuid, currentRoles },
          } = data as UserRolesChangedEvent;
          await this.setRoles(currentRoles);
          await this.updateFeatures(userUuid);
        }
      }
    );

    this.removefeatureReposObserver = this.itemManager.addObserver(
      ContentType.ExtensionRepo,
      async (changed, inserted, _discarded, _ignored, source) => {
        const sources = [
          PayloadSource.Constructor,
          PayloadSource.LocalRetrieved,
          PayloadSource.RemoteRetrieved,
          PayloadSource.FileImport,
        ];
        if (source && sources.includes(source)) {
          const items = [...changed, ...inserted].filter(
            (item) => !item.deleted
          ) as SNFeatureRepo[];
          if (
            this.credentialService.isSignedIn() &&
            !this.apiService.isCustomServerHostUsed()
          ) {
            await this.migrateFeatureRepoToUserSetting(items);
          } else {
            await this.migrateFeatureRepoToOfflineEntitlements(items);
          }
        }
      }
    );

    this.removeSignInObserver = this.credentialService.addEventObserver(
      (eventName: AccountEvent) => {
        if (eventName === AccountEvent.SignedInOrRegistered) {
          const featureRepos = this.itemManager.getItems(
            ContentType.ExtensionRepo
          ) as SNFeatureRepo[];
          if (!this.apiService.isCustomServerHostUsed()) {
            void this.migrateFeatureRepoToUserSetting(featureRepos);
          }
        }
      }
    );
  }

  async handleApplicationStage(stage: ApplicationStage): Promise<void> {
    await super.handleApplicationStage(stage);
    if (stage === ApplicationStage.FullSyncCompleted_13) {
      const offlineRepo = this.getOfflineRepo();
      if (offlineRepo) {
        this.downloadOfflineFeatures(offlineRepo);
      }
    }
  }

  public async setOfflineFeaturesCode(
    code: string
  ): Promise<SetOfflineFeaturesFunctionResponse> {
    try {
      const activationCodeWithoutSpaces = code.replace(/\s/g, '');
      const decodedData = await this.crypto.base64Decode(
        activationCodeWithoutSpaces
      );
      const result = this.parseOfflineEntitlementsCode(decodedData);
      if (isErrorObject(result)) {
        return result;
      }
      const offlineRepo = (await this.itemManager.createItem(
        ContentType.ExtensionRepo,
        FillItemContent({
          offlineFeaturesUrl: result.featuresUrl,
          offlineKey: result.extensionKey,
          migratedToOfflineEntitlements: true,
        } as FeatureRepoContent),
        true
      )) as SNFeatureRepo;
      this.syncService.sync();
      return this.downloadOfflineFeatures(offlineRepo);
    } catch (err) {
      return {
        error: API_MESSAGE_FAILED_OFFLINE_ACTIVATION,
      };
    }
  }

  private getOfflineRepo(): SNFeatureRepo | undefined {
    const repos = this.itemManager.getItems(
      ContentType.ExtensionRepo
    ) as SNFeatureRepo[];
    return repos.filter((repo) => repo.migratedToOfflineEntitlements)[0];
  }

  public hasOfflineRepo(): boolean {
    return this.getOfflineRepo() != undefined;
  }

  public async deleteOfflineFeatureRepo(): Promise<void> {
    const repo = this.getOfflineRepo();
    if (repo) {
      await this.itemManager.setItemToBeDeleted(repo.uuid);
    }
    await this.storageService.removeValue(StorageKey.UserFeatures);
  }

  private parseOfflineEntitlementsCode(
    code: string
  ): GetOfflineSubscriptionDetailsResponse {
    try {
      const { featuresUrl, extensionKey } = JSON.parse(code);
      return {
        featuresUrl,
        extensionKey,
      };
    } catch (error) {
      return {
        error: API_MESSAGE_FAILED_OFFLINE_ACTIVATION,
      };
    }
  }

  private async downloadOfflineFeatures(
    repo: SNFeatureRepo
  ): Promise<SetOfflineFeaturesFunctionResponse> {
    const result = await this.apiService.downloadOfflineFeaturesFromRepo(repo);
    if (isErrorObject(result)) {
      return result;
    }
    await this.setFeatures(result.features);
    await this.mapFeaturesToItems(result.features);
  }

  public async migrateFeatureRepoToUserSetting(
    featureRepos: SNFeatureRepo[] = []
  ): Promise<void> {
    for (const item of featureRepos) {
      if (item.migratedToUserSetting) {
        continue;
      }
      if (item.onlineUrl) {
        const repoUrl: string = item.onlineUrl;
        const userKeyMatch = repoUrl.match(/\w{32,64}/);
        if (userKeyMatch && userKeyMatch.length > 0) {
          const userKey = userKeyMatch[0];
          await this.settingsService.updateSetting(
            SettingName.ExtensionKey,
            userKey,
            true
          );
          await this.itemManager.changeFeatureRepo(item.uuid, (m) => {
            m.migratedToUserSetting = true;
          });
        }
      }
    }
  }

  public async migrateFeatureRepoToOfflineEntitlements(
    featureRepos: SNFeatureRepo[] = []
  ): Promise<void> {
    for (const item of featureRepos) {
      if (item.migratedToOfflineEntitlements) {
        continue;
      }
      if (item.onlineUrl) {
        const repoUrl = item.onlineUrl;
        const { origin } = new URL(repoUrl);
        if (!origin.includes(LEGACY_PROD_EXT_ORIGIN)) {
          continue;
        }
        const userKeyMatch = repoUrl.match(/\w{32,64}/);
        if (userKeyMatch && userKeyMatch.length > 0) {
          const userKey = userKeyMatch[0];
          const updatedRepo = await this.itemManager.changeFeatureRepo(
            item.uuid,
            (m) => {
              m.offlineFeaturesUrl = PROD_OFFLINE_FEATURES_URL;
              m.offlineKey = userKey;
              m.migratedToOfflineEntitlements = true;
            }
          );
          await this.downloadOfflineFeatures(updatedRepo);
        }
      }
    }
  }

  public async initializeFromDisk(): Promise<void> {
    this.roles = await this.storageService.getValue(
      StorageKey.UserRoles,
      undefined,
      []
    );

    this.features = await this.storageService.getValue(
      StorageKey.UserFeatures,
      undefined,
      []
    );
  }

  public async updateRoles(
    userUuid: UuidString,
    roles: RoleName[]
  ): Promise<void> {
    const userRolesChanged = this.haveRolesChanged(roles);
    const needsInitialFeaturesUpdate = !this.initialFeaturesUpdateDone;
    if (userRolesChanged || needsInitialFeaturesUpdate) {
      this.initialFeaturesUpdateDone = true;
      await this.setRoles(roles);
      await this.updateFeatures(userUuid);
    }
  }

  private async setRoles(roles: RoleName[]): Promise<void> {
    this.roles = roles;
    if (!arraysEqual(this.roles, roles)) {
      this.notifyEvent(FeaturesEvent.UserRolesChanged);
    }
    await this.storageService.setValue(StorageKey.UserRoles, this.roles);
  }

  private async setFeatures(features: FeatureDescription[]): Promise<void> {
    this.features = features;
    await this.storageService.setValue(StorageKey.UserFeatures, this.features);
  }

  public getFeature(
    featureId: FeatureIdentifier
  ): FeatureDescription | undefined {
    return this.features.find((feature) => feature.identifier === featureId);
  }

  private haveRolesChanged(roles: RoleName[]): boolean {
    return (
      roles.some((role) => !this.roles.includes(role)) ||
      this.roles.some((role) => !roles.includes(role))
    );
  }

  private async updateFeatures(userUuid: UuidString): Promise<void> {
    const featuresResponse = await this.apiService.getUserFeatures(userUuid);
    if (!featuresResponse.error && featuresResponse.data && !this.deinited) {
      const features = (featuresResponse as UserFeaturesResponse).data.features;
      features.forEach((feature) => {
        if (feature.expires_at) {
          feature.expires_at = convertTimestampToMilliseconds(
            feature.expires_at
          );
        }
      });
      await this.setFeatures(features);
      await this.mapFeaturesToItems(features);
    }
  }

  private componentContentForFeatureDescription(
    feature: FeatureDescription
  ): PayloadContent {
    const componentContent: Partial<ComponentContent> = {
      area: feature.area,
      hosted_url: feature.url,
      name: feature.name,
      package_info: feature,
      valid_until: new Date(feature.expires_at || 0),
    };
    return FillItemContent(componentContent);
  }

  private async mapFeaturesToItems(
    features: FeatureDescription[]
  ): Promise<void> {
    const currentItems = this.itemManager.getItems([
      ContentType.Component,
      ContentType.Theme,
    ]);
    const itemsToDeleteUuids = [];
    const now = new Date();
    let hasChanges = false;
    for (const feature of features) {
      if (!feature.content_type) {
        continue;
      }
      const expired =
        new Date(feature.expires_at || 0).getTime() < now.getTime();
      const existingItem = currentItems.find((item) => {
        if (item.safeContent.package_info) {
          const itemIdentifier = item.safeContent.package_info.identifier;
          return itemIdentifier === feature.identifier && !item.deleted;
        }
        return false;
      }) as SNComponent;

      let resultingItem: SNComponent | undefined = existingItem as SNComponent;

      if (existingItem) {
        const expiresAt = new Date(feature.expires_at || 0);
        const hasChange =
          feature.url !== existingItem.hosted_url ||
          feature.version !== existingItem.package_info.version ||
          expiresAt.getTime() !== existingItem.valid_until.getTime();
        if (hasChange) {
          resultingItem = await this.itemManager.changeComponent(
            existingItem.uuid,
            (mutator) => {
              mutator.hosted_url = feature.url;
              mutator.package_info = feature;
              mutator.valid_until = expiresAt;
            }
          );
          hasChanges = true;
        } else {
          resultingItem = existingItem;
        }
      } else if (!expired || feature.content_type === ContentType.Component) {
        resultingItem = (await this.itemManager.createItem(
          feature.content_type,
          this.componentContentForFeatureDescription(feature),
          true
        )) as SNComponent;
        hasChanges = true;
      }

      if (expired && resultingItem) {
        if (feature.content_type === ContentType.Component) {
          this.componentManager.setReadonlyStateForComponent(
            resultingItem,
            expired
          );
        } else {
          itemsToDeleteUuids.push(resultingItem.uuid);
          hasChanges = true;
        }
      }
    }

    await this.itemManager.setItemsToBeDeleted(itemsToDeleteUuids);
    if (hasChanges) {
      this.syncService.sync();
    }
  }

  public async validateAndDownloadExternalFeature(
    url: string
  ): Promise<SNComponent | undefined> {
    try {
      const trustedCustomExtensionsUrls = [
        ...TRUSTED_FEATURE_HOSTS,
        ...TRUSTED_CUSTOM_EXTENSIONS_HOSTS,
      ];
      const { host } = new URL(url);
      if (!trustedCustomExtensionsUrls.includes(host)) {
        const didConfirm = await this.alertService.confirm(
          API_MESSAGE_UNTRUSTED_EXTENSIONS_WARNING,
          'Install extension from an untrusted source?',
          'Proceed to install',
          ButtonType.Danger,
          'Cancel'
        );
        if (didConfirm) {
          return this.downloadExternalFeature(url);
        }
      } else {
        return this.downloadExternalFeature(url);
      }
    } catch (err) {
      this.alertService.alert(INVALID_EXTENSION_URL);
    }
  }

  private async downloadExternalFeature(
    url: string
  ): Promise<SNComponent | undefined> {
    const response = await this.apiService.downloadFeatureUrl(url);
    if (response.error) {
      await this.alertService.alert(API_MESSAGE_FAILED_DOWNLOADING_EXTENSION);
      return undefined;
    }
    const rawFeature = response.data as FeatureDescription;
    if (!rawFeature.content_type) {
      return;
    }
    const content = this.componentContentForFeatureDescription(rawFeature);
    const component = (await this.itemManager.createTemplateItem(
      rawFeature.content_type,
      content
    )) as SNComponent;
    return component;
  }

  deinit(): void {
    super.deinit();
    this.removeSignInObserver();
    (this.removeSignInObserver as unknown) = undefined;
    this.removeApiServiceObserver();
    (this.removeApiServiceObserver as unknown) = undefined;
    this.removeWebSocketsServiceObserver();
    (this.removeWebSocketsServiceObserver as unknown) = undefined;
    this.removefeatureReposObserver();
    (this.removefeatureReposObserver as unknown) = undefined;
    (this.roles as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    (this.apiService as unknown) = undefined;
    (this.itemManager as unknown) = undefined;
    (this.componentManager as unknown) = undefined;
    (this.webSocketsService as unknown) = undefined;
    (this.settingsService as unknown) = undefined;
    (this.credentialService as unknown) = undefined;
    (this.syncService as unknown) = undefined;
    (this.alertService as unknown) = undefined;
    (this.sessionManager as unknown) = undefined;
    (this.crypto as unknown) = undefined;
    this.deinited = true;
  }
}

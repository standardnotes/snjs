import { SNItem } from '@Models/core/item';
import { ApplicationStage } from '@standardnotes/common';
import { LEGACY_PROD_EXT_ORIGIN, PROD_OFFLINE_FEATURES_URL } from './../hosts';
import {
  SNFeatureRepo,
  FeatureRepoContent,
} from './../models/app/feature_repo';
import { SNSyncService } from './sync/sync_service';
import { AccountEvent, SNCredentialService } from './credential_service';
import { UserRolesChangedEvent } from '@standardnotes/domain-events';
import { StorageKey } from '@Lib/storage_keys';
import { SNStorageService } from './storage_service';
import {
  ApiServiceEvent,
  MetaReceivedData,
  SNApiService,
} from './api/api_service';
import { UuidString } from '@Lib/types';
import {
  FeatureDescription,
  ThirdPartyFeatureDescription,
  FeatureIdentifier,
  GetFeatures,
  FindNativeFeature,
  DeprecatedFeatures,
} from '@standardnotes/features';
import {
  ContentType,
  ErrorObject,
  Runtime,
  RoleName,
} from '@standardnotes/common';
import { ItemManager } from './item_manager';
import { UserFeaturesResponse } from './api/responses';
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
} from '@standardnotes/utils';
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
} from '@Lib/hosts';
import { Copy, lastElement } from '@standardnotes/utils';
import { AbstractService } from '@standardnotes/services';

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
  FeaturesUpdated = 'FeaturesUpdated',
}

export const enum FeatureStatus {
  NoUserSubscription = 'NoUserSubscription',
  NotInCurrentPlan = 'NotInCurrentPlan',
  InCurrentPlanButExpired = 'InCurrentPlanButExpired',
  Entitled = 'Entitled',
}

export class SNFeaturesService extends AbstractService<FeaturesEvent> {
  private deinited = false;
  private roles: RoleName[] = [];
  private features: FeatureDescription[] = [];
  private removeApiServiceObserver: () => void;
  private removeWebSocketsServiceObserver: () => void;
  private removefeatureReposObserver: () => void;
  private removeSignInObserver: () => void;
  private needsInitialFeaturesUpdate = true;
  private completedSuccessfulFeaturesRetrieval = false;

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private itemManager: ItemManager,
    private webSocketsService: SNWebSocketsService,
    private settingsService: SNSettingsService,
    private credentialService: SNCredentialService,
    private syncService: SNSyncService,
    private alertService: SNAlertService,
    private sessionManager: SNSessionManager,
    private crypto: SNPureCrypto,
    private runtime: Runtime
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
          await this.updateRolesAndFetchFeatures(
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
          await this.updateRolesAndFetchFeatures(userUuid, currentRoles);
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
          if (this.sessionManager.isSignedIntoFirstPartyServer()) {
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
          if (!this.apiService.isThirdPartyHostUsed()) {
            void this.migrateFeatureRepoToUserSetting(featureRepos);
          }
        }
      }
    );
  }

  async handleApplicationStage(stage: ApplicationStage): Promise<void> {
    await super.handleApplicationStage(stage);
    if (stage === ApplicationStage.FullSyncCompleted_13) {
      if (!this.hasOnlineSubscription()) {
        const offlineRepo = this.getOfflineRepo();
        if (offlineRepo) {
          this.downloadOfflineFeatures(offlineRepo);
        }
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
      this.syncService.sync();
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
    await this.didDownloadFeatures(result.features);
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

  public async updateRolesAndFetchFeatures(
    userUuid: UuidString,
    roles: RoleName[]
  ): Promise<void> {
    const userRolesChanged = this.haveRolesChanged(roles);
    if (userRolesChanged || this.needsInitialFeaturesUpdate) {
      this.needsInitialFeaturesUpdate = false;
      await this.setRoles(roles);
      const featuresResponse = await this.apiService.getUserFeatures(userUuid);
      if (!featuresResponse.error && featuresResponse.data && !this.deinited) {
        const features = (featuresResponse as UserFeaturesResponse).data
          .features;
        await this.didDownloadFeatures(features);
      }
    }
  }

  private async setRoles(roles: RoleName[]): Promise<void> {
    this.roles = roles;
    if (!arraysEqual(this.roles, roles)) {
      this.notifyEvent(FeaturesEvent.UserRolesChanged);
    }
    await this.storageService.setValue(StorageKey.UserRoles, this.roles);
  }

  public async didDownloadFeatures(
    features: FeatureDescription[]
  ): Promise<void> {
    features = features
      .filter((feature) => !!FindNativeFeature(feature.identifier))
      .map((feature) => this.mapRemoteNativeFeatureToStaticFeature(feature));

    this.features = features;
    this.completedSuccessfulFeaturesRetrieval = true;
    this.notifyEvent(FeaturesEvent.FeaturesUpdated);
    this.storageService.setValue(StorageKey.UserFeatures, this.features);

    await this.mapRemoteNativeFeaturesToItems(features);
  }

  public isThirdPartyFeature(identifier: string): boolean {
    const isNativeFeature = !!FindNativeFeature(
      identifier as FeatureIdentifier
    );
    return !isNativeFeature;
  }

  private mapRemoteNativeFeatureToStaticFeature(
    remoteFeature: FeatureDescription
  ): FeatureDescription {
    const remoteFields: (keyof FeatureDescription)[] = [
      'expires_at',
      'role_name',
      'no_expire',
      'permission_name',
    ];

    const nativeFeature = FindNativeFeature(remoteFeature.identifier);

    if (!nativeFeature) {
      throw Error(
        `Attempting to map remote native to unfound static feature ${remoteFeature.identifier}`
      );
    }

    const nativeFeatureCopy = Copy(nativeFeature) as FeatureDescription;

    for (const field of remoteFields) {
      nativeFeatureCopy[field] = remoteFeature[field] as never;
    }

    if (nativeFeatureCopy.expires_at) {
      nativeFeatureCopy.expires_at = convertTimestampToMilliseconds(
        nativeFeatureCopy.expires_at
      );
    }
    return nativeFeatureCopy;
  }

  public getFeature(
    featureId: FeatureIdentifier
  ): FeatureDescription | undefined {
    return this.features.find((feature) => feature.identifier === featureId);
  }

  private hasOnlineSubscription(): boolean {
    if (this.sessionManager.isSignedIntoFirstPartyServer()) {
      const roles = this.roles;
      const unpaidRoles = [RoleName.BasicUser];
      return roles.some((role) => !unpaidRoles.includes(role));
    } else {
      return false;
    }
  }

  public hasPaidOnlineOrOfflineSubscription(): boolean {
    return this.hasOnlineSubscription() || this.hasOfflineRepo();
  }

  public rolesBySorting(roles: RoleName[]): RoleName[] {
    return Object.values(RoleName).filter((role) => roles.includes(role));
  }

  public hasMinimumRole(role: RoleName): boolean {
    const sortedAllRoles = Object.values(RoleName);

    const sortedUserRoles = this.rolesBySorting(this.roles);

    const highestUserRoleIndex = sortedAllRoles.indexOf(
      lastElement(sortedUserRoles) as RoleName
    );

    const indexOfRoleToCheck = sortedAllRoles.indexOf(role);

    return indexOfRoleToCheck <= highestUserRoleIndex;
  }

  public isFeatureDeprecated(featureId: FeatureIdentifier): boolean {
    return DeprecatedFeatures.includes(featureId);
  }

  public getFeatureStatus(featureId: FeatureIdentifier): FeatureStatus {
    const isDeprecated = this.isFeatureDeprecated(featureId);
    if (isDeprecated) {
      if (this.hasPaidOnlineOrOfflineSubscription()) {
        return FeatureStatus.Entitled;
      } else {
        return FeatureStatus.NoUserSubscription;
      }
    }

    const isThirdParty = FindNativeFeature(featureId) == undefined;
    if (isThirdParty) {
      const component = this.itemManager.components.find(
        (candidate) => candidate.identifier === featureId
      );
      if (!component) {
        return FeatureStatus.NoUserSubscription;
      }
      if (component.isExpired) {
        return FeatureStatus.InCurrentPlanButExpired;
      }
      return FeatureStatus.Entitled;
    }

    if (this.hasPaidOnlineOrOfflineSubscription()) {
      if (!this.completedSuccessfulFeaturesRetrieval) {
        const hasCachedFeatures = this.features.length > 0;
        const temporarilyAllowUntilServerUpdates = !hasCachedFeatures;
        if (temporarilyAllowUntilServerUpdates) {
          return FeatureStatus.Entitled;
        }
      }
    } else {
      return FeatureStatus.NoUserSubscription;
    }

    const feature = this.features.find(
      (feature) => feature.identifier === featureId
    );
    if (!feature) {
      return FeatureStatus.NotInCurrentPlan;
    }

    const expired =
      feature.expires_at &&
      new Date(feature.expires_at).getTime() < new Date().getTime();
    if (expired) {
      if (!this.roles.includes(feature.role_name as RoleName)) {
        return FeatureStatus.NotInCurrentPlan;
      } else {
        return FeatureStatus.InCurrentPlanButExpired;
      }
    }

    return FeatureStatus.Entitled;
  }

  private haveRolesChanged(roles: RoleName[]): boolean {
    return (
      roles.some((role) => !this.roles.includes(role)) ||
      this.roles.some((role) => !roles.includes(role))
    );
  }

  private componentContentForNativeFeatureDescription(
    feature: FeatureDescription
  ): PayloadContent {
    const componentContent: Partial<ComponentContent> = {
      area: feature.area,
      name: feature.name,
      package_info: feature,
      valid_until: new Date(feature.expires_at || 0),
    };
    return FillItemContent(componentContent);
  }

  private async mapRemoteNativeFeaturesToItems(
    features: FeatureDescription[]
  ): Promise<void> {
    const currentItems = this.itemManager.getItems([
      ContentType.Component,
      ContentType.Theme,
    ]);
    const itemsToDeleteUuids: UuidString[] = [];
    let hasChanges = false;
    for (const feature of features) {
      const didChange = await this.mapNativeFeatureToItem(
        feature,
        currentItems,
        itemsToDeleteUuids
      );
      if (didChange) {
        hasChanges = true;
      }
    }

    await this.itemManager.setItemsToBeDeleted(itemsToDeleteUuids);
    if (hasChanges) {
      this.syncService.sync();
    }
  }

  private async mapNativeFeatureToItem(
    feature: FeatureDescription,
    currentItems: SNItem[],
    itemsToDeleteUuids: UuidString[]
  ): Promise<boolean> {
    if (!feature.content_type) {
      return false;
    }

    let hasChanges = false;
    const now = new Date();
    const expired = new Date(feature.expires_at || 0).getTime() < now.getTime();

    const existingItem = currentItems.find((item) => {
      if (item.safeContent.package_info) {
        const itemIdentifier = item.safeContent.package_info.identifier;
        return itemIdentifier === feature.identifier && !item.deleted;
      }
      return false;
    }) as SNComponent;

    let resultingItem: SNComponent | undefined = existingItem as SNComponent;

    if (existingItem) {
      const featureExpiresAt = new Date(feature.expires_at || 0);
      const hasChange =
        feature.version !== existingItem.package_info.version ||
        featureExpiresAt.getTime() !== existingItem.valid_until.getTime();
      if (hasChange) {
        resultingItem = await this.itemManager.changeComponent(
          existingItem.uuid,
          (mutator) => {
            mutator.package_info = feature;
            mutator.valid_until = featureExpiresAt;
          }
        );
        hasChanges = true;
      } else {
        resultingItem = existingItem;
      }
    } else if (!expired || feature.content_type === ContentType.Component) {
      resultingItem = (await this.itemManager.createItem(
        feature.content_type,
        this.componentContentForNativeFeatureDescription(feature),
        true
      )) as SNComponent;
      hasChanges = true;
    }

    if (expired && resultingItem) {
      if (feature.content_type !== ContentType.Component) {
        itemsToDeleteUuids.push(resultingItem.uuid);
        hasChanges = true;
      }
    }

    return hasChanges;
  }

  public async validateAndDownloadExternalFeature(
    urlOrCode: string
  ): Promise<SNComponent | undefined> {
    let url = urlOrCode;
    try {
      url = await this.crypto.base64Decode(urlOrCode);
      // eslint-disable-next-line no-empty
    } catch (err) {}

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
    const rawFeature = response.data as ThirdPartyFeatureDescription;
    if (!rawFeature.content_type) {
      return;
    }

    const nativeFeature = FindNativeFeature(rawFeature.identifier);
    if (nativeFeature) {
      await this.alertService.alert(API_MESSAGE_FAILED_DOWNLOADING_EXTENSION);
      return;
    }

    if (rawFeature.url) {
      for (const nativeFeature of GetFeatures(this.runtime)) {
        if (rawFeature.url.includes(nativeFeature.identifier)) {
          await this.alertService.alert(
            API_MESSAGE_FAILED_DOWNLOADING_EXTENSION
          );
          return;
        }
      }
    }

    const content = FillItemContent({
      area: rawFeature.area,
      name: rawFeature.name,
      package_info: rawFeature,
      valid_until: new Date(rawFeature.expires_at || 0),
      hosted_url: rawFeature.url,
    } as Partial<ComponentContent>);
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

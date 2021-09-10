import { ComponentPackageInfo } from './../models/app/component';
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
import { UuidString } from '@Lib/types';
import { FeatureDescription, FeatureIdentifier } from '@standardnotes/features';
import { ContentType } from '@standardnotes/common';
import { ItemManager } from './item_manager';
import { UserFeaturesResponse } from './api/responses';
import { SNComponentManager } from './component_manager';
import { SNComponent, SNItem } from '@Lib/models';
import { SNWebSocketsService, WebSocketsServiceEvent } from './api/websockets_service';
import { FillItemContent } from '@Lib/models/functions';
import { PayloadContent } from '@Lib/protocol';
import { ComponentContent } from '@Lib/models/app/component';
import { SNSettingsService } from './settings_service';
import { SettingName } from '@standardnotes/settings';
import { SNSessionManager } from './api/session_manager';

export class SNFeaturesService extends PureService<void> {
  private deinited = false;
  private roles: RoleName[] = [];
  private features: FeatureDescription[] = [];
  private removeApiServiceObserver?: () => void;
  private removeWebSocketsServiceObserver?: () => void;
  private removeExtensionRepoItemsObserver?: () => void;
  private initialFeaturesUpdateDone = false;

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private itemManager: ItemManager,
    private componentManager: SNComponentManager,
    private webSocketsService: SNWebSocketsService,
    private settingsService: SNSettingsService,
    private sessionManager: SNSessionManager,
    private enableV4: boolean,
  ) {
    super();

    this.removeApiServiceObserver = apiService.addEventObserver(
      async (eventName, data) => {
        if (eventName === ApiServiceEvent.MetaReceived) {
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

    this.removeExtensionRepoItemsObserver = this.itemManager.addObserver(
      ContentType.ExtensionRepo,
      async (changed, inserted) => {
        const items = [...changed, ...inserted];
        await this.updateExtensionKeySetting(items);
      }
    );
  }

  public async updateExtensionKeySetting(extensionRepoItems: SNItem[]): Promise<void> {
    for (const item of extensionRepoItems) {
      if (item.safeContent.package_info) {
        const repoUrl: string = item.safeContent.package_info.url;
        const userKeyMatch = repoUrl.match(/\w{32,64}/);
        if (userKeyMatch && userKeyMatch.length > 0) {
          const userKey = userKeyMatch[0];
          await this.settingsService
            .updateSetting(SettingName.ExtensionKey, userKey, true);
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
    const needsInitialFeaturesUpdate = !this.initialFeaturesUpdateDone && this.features.length === 0;
    if (userRolesChanged || needsInitialFeaturesUpdate) {
      await this.setRoles(roles);
      await this.updateFeatures(userUuid);
      this.initialFeaturesUpdateDone = true;
    }
  }

  private async setRoles(roles: RoleName[]): Promise<void> {
    this.roles = roles;
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
      const features = (featuresResponse as UserFeaturesResponse).data.features
      await this.setFeatures(features);
      if (this.enableV4) {
        await this.mapFeaturesToItems(features);
      }
    }
  }

  private componentContentForFeatureDescription(
    feature: FeatureDescription
  ): PayloadContent {
    const content: Partial<ComponentContent> & { identifier: string, url: string } = {
      identifier: feature.identifier,
      name: feature.name,
      hosted_url: feature.url,
      url: feature.url,
      area: feature.area,
      package_info: feature as ComponentPackageInfo,
      valid_until: new Date(feature.expires_at || 0),
    };
    return FillItemContent(content);
  }

  private async mapFeaturesToItems(features: FeatureDescription[]): Promise<void> {
    const currentItems = this.itemManager.getItems([
      ContentType.Component,
      ContentType.Theme,
    ]);
    const itemsToDeleteUuids = [];

    const now = new Date();

    for (const feature of features) {
      if (!feature.content_type) {
        continue;
      }

      const expired = feature.expires_at! < now.getTime();
      const itemContent = this.componentContentForFeatureDescription(feature);
      const existingItem = currentItems.find((item) => {
        if (item.safeContent.package_info) {
          const itemIdentifier = item.safeContent.package_info.identifier;
          return itemIdentifier === feature.identifier && !item.deleted;
        }
        return false;
      });

      switch (feature.content_type) {
        case ContentType.Component:
          if (existingItem) {
            await this.itemManager.changeComponent(
              existingItem.uuid,
              (mutator) => {
                mutator.setContent({
                  ...existingItem.safeContent,
                  ...itemContent
                });
              }
            );
            if (expired) {
              this.componentManager.setReadonlyStateForComponent(
                existingItem as SNComponent,
                expired
              );
            }
          } else {
            const newItem = await this.itemManager.createItem(feature.content_type, itemContent);
            if (expired) {
              this.componentManager.setReadonlyStateForComponent(
                newItem as SNComponent,
                expired
              );
            }
          }
          break;
        default:
          if (existingItem) {
            await this.itemManager.changeComponent(
              existingItem.uuid,
              (mutator) => {
                mutator.setContent({
                  ...existingItem.safeContent,
                  ...itemContent
                });
              }
            );
            if (expired) {
              itemsToDeleteUuids.push(existingItem.uuid);
            }
          } else if (!expired) {
            await this.itemManager.createItem(feature.content_type, itemContent);
          }
          break;
      }
    }

    await this.itemManager.setItemsToBeDeleted(itemsToDeleteUuids);
  }

  public async downloadExternalFeature(url: string): Promise<SNComponent | undefined> {
    const response = await this.apiService.downloadFeatureUrl(url);
    if (response.error) {
      return undefined;
    }
    const rawFeature = response.data as FeatureDescription;
    if (!rawFeature.content_type) {
      return;
    }
    const content = this.componentContentForFeatureDescription(rawFeature);
    const component = await this.itemManager.createTemplateItem(rawFeature.content_type, content) as SNComponent;
    return component;
  }

  deinit(): void {
    super.deinit();
    this.removeApiServiceObserver?.();
    (this.removeApiServiceObserver as unknown) = undefined;
    this.removeWebSocketsServiceObserver?.();
    (this.removeWebSocketsServiceObserver as unknown) = undefined;
    this.removeExtensionRepoItemsObserver?.();
    (this.removeExtensionRepoItemsObserver as unknown) = undefined;
    (this.roles as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    (this.apiService as unknown) = undefined;
    (this.itemManager as unknown) = undefined;
    (this.componentManager as unknown) = undefined;
    (this.webSocketsService as unknown) = undefined;
    (this.settingsService as unknown) = undefined;
    (this.sessionManager as unknown) = undefined;
    this.deinited = true;
  }
}

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
import { ContentType, Feature } from '@standardnotes/features';
import { ItemManager } from './item_manager';
import { UserFeaturesResponse } from './api/responses';
import { SNComponentManager } from './component_manager';
import { SNComponent } from '@Lib/models';
import { SNWebSocketsService, WebSocketsServiceEvent } from './api/websockets_service';

export class SNFeaturesService extends PureService<void> {
  private roles: RoleName[] = [];
  private removeApiServiceObserver?: () => void;
  private removeWebSocketsServiceObserver?: () => void;

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private itemManager: ItemManager,
    private componentManager: SNComponentManager,
    private webSocketsService: SNWebSocketsService,
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
  }

  public async loadUserRoles(): Promise<void> {
    this.roles =
      (await this.storageService.getValue(StorageKey.UserRoles)) || [];
  }

  public async updateRoles(
    userUuid: UuidString,
    roles: RoleName[]
  ): Promise<void> {
    const userRolesChanged = this.haveRolesChanged(roles);
    if (userRolesChanged) {
      await this.setRoles(roles);
      await this.updateFeatures(userUuid);
    }
  }

  private async setRoles(roles: RoleName[]): Promise<void> {
    this.roles = roles;
    await this.storageService.setValue(StorageKey.UserRoles, this.roles);
  }

  private haveRolesChanged(roles: RoleName[]): boolean {
    return (
      roles.some((role) => !this.roles.includes(role)) ||
      this.roles.some((role) => !roles.includes(role))
    );
  }

  private async updateFeatures(userUuid: UuidString): Promise<void> {
    const featuresResponse = await this.apiService.getUserFeatures(userUuid);
    if (!featuresResponse.error && featuresResponse.data) {
      await this.mapFeaturesToItems(
        (featuresResponse as UserFeaturesResponse).data.features
      );
    }
  }

  private createItemDataForFeature(feature: Feature) {
    return {
      content_type: feature.contentType,
      content: {
        identifier: feature.identifier,
        name: feature.name,
        hosted_url: feature.url,
        url: feature.url,
        local_url: null,
        area: feature.area,
        package_info: feature,
        valid_until: feature.expiresAt,
      },
      references: [],
    };
  }

  private async mapFeaturesToItems(features: Feature[]): Promise<void> {
    const currentItems = this.itemManager.getItems([
      ContentType.Component,
      ContentType.Theme,
    ]);
    const itemsToDeleteUuids = [];

    const today = new Date();

    for (const feature of features) {
      const expired = feature.expiresAt! < today.getTime();
      const itemData = this.createItemDataForFeature(feature);      
      const existingItem = currentItems.find((item) => {
        if (
          item.content &&
          typeof item.content !== 'string' &&
          item.content.package_info
        ) {
          const itemIdentifier = item.content.package_info.identifier;
          return itemIdentifier === feature.identifier && !item.deleted;
        }
        return false;
      });

      switch (feature.contentType) {
        case ContentType.Component:
          if (existingItem) {
            await this.itemManager.changeComponent(existingItem.uuid, (mutator) => {
              mutator.setContent(itemData);
            });
          } else {
            await this.itemManager.createItem(feature.contentType, itemData);
          }
          this.componentManager.setReadonlyStateForComponent(existingItem as SNComponent, expired);
          break;
        default:
          if (existingItem) {
            await this.itemManager.changeComponent(existingItem.uuid, (mutator) => {
              mutator.setContent(itemData);
            });
            if (expired) {
              itemsToDeleteUuids.push(existingItem.uuid);
            }
          } else if (!expired) {
            await this.itemManager.createItem(feature.contentType, itemData);
          }
          break;
      }
    }

    await this.itemManager.setItemsToBeDeleted(itemsToDeleteUuids);
  }

  deinit(): void {
    super.deinit();
    this.removeApiServiceObserver?.();
    (this.removeApiServiceObserver as unknown) = undefined;
    this.removeWebSocketsServiceObserver?.();
    (this.removeWebSocketsServiceObserver as unknown) = undefined;
    (this.roles as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    (this.apiService as unknown) = undefined;
    (this.itemManager as unknown) = undefined;
    (this.componentManager as unknown) = undefined;
    (this.webSocketsService as unknown) = undefined;
  }
}

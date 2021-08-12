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

export class SNFeaturesService extends PureService<void> {
  private roles: RoleName[] = [];
  private webSocket?: WebSocket;
  private removeApiServiceObserver?: () => void;

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private itemManager: ItemManager,
    private webSocketUrl: string | undefined
  ) {
    super();

    this.removeApiServiceObserver = apiService.addEventObserver(
      (eventName, data) => {
        if (eventName === ApiServiceEvent.MetaReceived) {
          const { userUuid, userRoles } = data as MetaReceivedData;
          this.updateRoles(
            userUuid,
            userRoles.map((role) => role.name)
          );
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
      this.setRoles(roles);
      await this.updateFeatures(userUuid);
    }
  }

  public async setWebSocketUrl(url: string | undefined): Promise<void> {
    this.webSocketUrl = url;
    await this.storageService.setValue(StorageKey.WebSocketUrl, url);
  }

  public async loadWebSocketUrl(): Promise<void> {
    const storedValue = await this.storageService.getValue(
      StorageKey.WebSocketUrl
    );
    this.webSocketUrl =
      storedValue ||
      this.webSocketUrl ||
      (window as {
        _websocket_url?: string;
      })._websocket_url;
  }

  public startWebSocketConnection(authToken: string): void {
    if (this.webSocketUrl) {
      this.webSocket = new WebSocket(
        `${this.webSocketUrl}?authToken=Bearer+${authToken}`
      );
      this.webSocket.onmessage = this.onWebSocketMessage.bind(this);
      this.webSocket.onclose = this.onWebSocketClose.bind(this);
    }
  }

  public closeWebSocketConnection(): void {
    this.webSocket?.close();
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

    for (const feature of features) {
      const itemData = this.createItemDataForFeature(feature);
      const existingItem = currentItems.find((item) => {
        if (
          item.content &&
          typeof item.content !== 'string' &&
          item.content.package_info
        ) {
          return item.content.package_info.identifier === feature.identifier && !item.deleted;
        }
        return false;
      });
      if (existingItem) {
        await this.itemManager.changeComponent(existingItem.uuid, (mutator) => {
          mutator.setContent(itemData);
        });
      } else {
        await this.itemManager.createItem(feature.contentType, itemData);
      }
    }
  }

  private async onWebSocketMessage(event: MessageEvent) {
    const {
      payload: { userUuid, currentRoles },
    }: UserRolesChangedEvent = JSON.parse(event.data);
    this.setRoles(currentRoles);
    await this.updateFeatures(userUuid);
  }

  private onWebSocketClose() {
    this.webSocket = undefined;
  }

  deinit(): void {
    this.removeApiServiceObserver?.();
    this.closeWebSocketConnection();
    (this.removeApiServiceObserver as unknown) = undefined;
    (this.roles as unknown) = undefined;
  }
}

import { StorageKey } from '@Lib/storage_keys';
import { Permission, Role } from '@standardnotes/auth';
import { PureService } from './pure_service';
import { SNStorageService } from './storage_service';

export enum PermissionsEvent {
  PermissionsChanged = 'PermissionsChanged',
}

export type PermissionsEventData = {
  roles: Set<Role>;
  permissions: Set<Permission>;
};
export class SNPermissionsService extends PureService<
  PermissionsEvent.PermissionsChanged,
  PermissionsEventData
> {
  private roles = new Set<Role>();
  private permissions = new Set<Permission>();
  private webSocket?: WebSocket;

  constructor(
    private storageService: SNStorageService,
    private webSocketUrl: string | undefined,
  ) {
    super();
  }

  private setRoles(roles: Role[]): void {
    this.roles = new Set(roles);
    this.storageService.setValue(StorageKey.UserRoles, this.roles);
  }

  private setPermissions(permissions: Permission[]): void {
    this.permissions = new Set(permissions);
    this.storageService.setValue(StorageKey.UserPermissions, this.permissions);
  }

  public hasPermission(permission: Permission): boolean {
    const storedPermissions = this.storageService.getValue(StorageKey.UserPermissions);
    return storedPermissions?.has(permission) || this.permissions.has(permission);
  }

  public update(roles: Role[], permissions: Permission[]): void {
    this.setRoles(roles);
    if (
      this.permissions.size !== permissions.length ||
      permissions.some((permission) => !this.permissions.has(permission))
    ) {
      this.setPermissions(permissions);
      this.notifyEvent(PermissionsEvent.PermissionsChanged, {
        roles: this.roles,
        permissions: this.permissions,
      });
    }
  }

  public async setWebSocketUrl(url: string | undefined): Promise<void> {
    this.webSocketUrl = url;
    await this.storageService.setValue(
      StorageKey.WebSocketUrl,
      url
    );
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

  private onWebSocketMessage(event: MessageEvent) {
    const {
      auth: { roles, permissions },
    } = JSON.parse(event.data);
    this.update(roles, permissions);
  }

  private onWebSocketClose() {
    this.webSocket = undefined;
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

  deinit(): void {
    (this.roles as unknown) = undefined;
    (this.permissions as unknown) = undefined;
    this.closeWebSocketConnection();
  }
}

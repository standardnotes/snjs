import { StorageKey } from '@Lib/storage_keys';
import { Permission, Role, PermissionName } from '@standardnotes/auth';
import { PureService } from './pure_service';
import { SNStorageService } from './storage_service';

export enum PermissionsEvent {
  PermissionsChanged = 'PermissionsChanged',
}

export type PermissionsEventData = {
  roles: Role[];
  permissions: Permission[];
};
export class SNPermissionsService extends PureService<
  PermissionsEvent.PermissionsChanged,
  PermissionsEventData
> {
  private roles: Role[] = [];
  private permissions: Permission[] = [];
  private webSocket?: WebSocket;

  constructor(
    private storageService: SNStorageService,
    private webSocketUrl: string | undefined
  ) {
    super();
  }

  private async setRoles(roles: Role[]): Promise<void> {
    this.roles = roles;
    await this.storageService.setValue(StorageKey.UserRoles, this.roles);
  }

  private async setPermissions(permissions: Permission[]): Promise<void> {
    this.permissions = permissions;
    await this.storageService.setValue(
      StorageKey.UserPermissions,
      this.permissions
    );
  }

  public hasPermission(permissionName: PermissionName): boolean {
    const storedPermissions = this.storageService.getValue(
      StorageKey.UserPermissions
    );
    return (
      this.permissions.some((p) => p.name === permissionName) ||
      storedPermissions?.some((p: Permission) => p.name === permissionName)
    );
  }

  public async update(roles: Role[], permissions: Permission[]): Promise<void> {
    await this.setRoles(roles);
    await this.setPermissions(permissions);
    void this.notifyEvent(PermissionsEvent.PermissionsChanged, {
      roles: this.roles,
      permissions: this.permissions,
    });
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

  private async onWebSocketMessage(event: MessageEvent) {
    const {
      auth: { roles, permissions },
    } = JSON.parse(event.data);
    await this.update(roles, permissions);
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

import { UserRolesChangedEvent } from '@standardnotes/domain-events';
import { StorageKey } from '@Lib/storage_keys';
import { PureService } from './pure_service';
import { SNStorageService } from './storage_service';
import { RoleName } from '@standardnotes/auth';
import { ApiServiceEvent, SNApiService } from './api/api_service';

export class SNFeaturesService extends PureService<void> {
  private roles: RoleName[] = [];
  private webSocket?: WebSocket;
  private removeApiServiceObserver?: () => void;

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private webSocketUrl: string | undefined
  ) {
    super();

    this.removeApiServiceObserver = this.apiService.addEventObserver(
      (eventName, data) => {
        if (eventName === ApiServiceEvent.MetaReceived) {
          this.updateRoles(data!.userRoles.map((role) => role.name));
        }
      }
    );
  }

  public async loadUserRoles(): Promise<void> {
    this.roles =
      (await this.storageService.getValue(StorageKey.UserRoles)) || [];
  }

  public async updateRoles(roles: RoleName[]): Promise<void> {
    const userRolesChanged = this.haveRolesChanged(roles);
    if (userRolesChanged) {
      this.setRoles(roles);
      await this.updateFeatures();
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
    return roles.some(
      (role) =>
        !this.roles.includes(role)
    );
  }

  private async updateFeatures(): Promise<void> {
    // Request new features and map them to items
  }

  private async onWebSocketMessage(event: MessageEvent) {
    const {
      payload: { currentRoles },
    }: UserRolesChangedEvent = JSON.parse(event.data);
    this.setRoles(currentRoles);
    await this.updateFeatures();
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

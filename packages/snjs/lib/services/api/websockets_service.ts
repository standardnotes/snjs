import { UserRolesChangedEvent } from '@standardnotes/domain-events';
import { StorageKey } from '@Lib/storage_keys';
import { PureService } from '../pure_service';
import { SNStorageService } from '../storage_service';

export enum WebSocketsServiceEvent {
  UserRoleMessageReceived = 'WebSocketMessageReceived',
}

export class SNWebSocketsService extends PureService<
  WebSocketsServiceEvent,
  UserRolesChangedEvent
> {
  private webSocket?: WebSocket;

  constructor(
    private storageService: SNStorageService,
    private webSocketUrl: string | undefined
  ) {
    super();
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
      try {
      this.webSocket = new WebSocket(
        `${this.webSocketUrl}?authToken=Bearer+${authToken}`
      );
      this.webSocket.onmessage = this.onWebSocketMessage.bind(this);
      this.webSocket.onclose = this.onWebSocketClose.bind(this);
      } catch (e) {
        console.error('Error starting WebSocket connection', e);
      }
    }
  }

  public closeWebSocketConnection(): void {
    this.webSocket?.close();
  }

  private onWebSocketMessage(event: MessageEvent) {
    const eventData: UserRolesChangedEvent = JSON.parse(event.data);
    void this.notifyEvent(
      WebSocketsServiceEvent.UserRoleMessageReceived,
      eventData
    );
  }

  private onWebSocketClose() {
    this.webSocket = undefined;
  }

  deinit(): void {
    super.deinit();
    (this.storageService as unknown) = undefined;
    this.closeWebSocketConnection();
  }
}

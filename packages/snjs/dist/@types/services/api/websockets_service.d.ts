import { UserRolesChangedEvent } from '@standardnotes/domain-events';
import { PureService } from '../pure_service';
import { SNStorageService } from '../storage_service';
export declare enum WebSocketsServiceEvent {
    UserRoleMessageReceived = "WebSocketMessageReceived"
}
export declare class SNWebSocketsService extends PureService<WebSocketsServiceEvent, UserRolesChangedEvent> {
    private storageService;
    private webSocketUrl;
    private webSocket?;
    constructor(storageService: SNStorageService, webSocketUrl: string | undefined);
    setWebSocketUrl(url: string | undefined): Promise<void>;
    loadWebSocketUrl(): Promise<void>;
    startWebSocketConnection(authToken: string): void;
    closeWebSocketConnection(): void;
    private onWebSocketMessage;
    private onWebSocketClose;
    deinit(): void;
}

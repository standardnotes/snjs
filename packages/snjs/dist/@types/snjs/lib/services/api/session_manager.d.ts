import { ProtocolVersion } from '../../../../protocol/versions';
import { ChallengeService } from './../challenge/challenge_service';
import { RemoteSession } from './session';
import { GetSubscriptionResponse, HttpResponse, SignInResponse, User } from './responses';
import { SNProtocolService } from './../protocol_service';
import { SNApiService } from './api_service';
import { SNStorageService } from './../storage_service';
import { SNRootKey } from '../../../../protocol/root_key';
import { AnyKeyParamsContent } from './../../protocol/key_params';
import { PureService } from '../../../../services/pure_service';
import { SNAlertService } from '../../../../services/alert_service';
import { Session } from '../../../../services/api/session';
import { UuidString } from '../../../../types';
import { SNWebSocketsService } from './websockets_service';
export declare const MINIMUM_PASSWORD_LENGTH = 8;
export declare const MissingAccountParams = "missing-params";
declare type SessionManagerResponse = {
    response: HttpResponse;
    rootKey?: SNRootKey;
    keyParams?: AnyKeyParamsContent;
};
export declare const enum SessionEvent {
    Restored = "SessionRestored",
    Revoked = "SessionRevoked"
}
/**
 * The session manager is responsible for loading initial user state, and any relevant
 * server credentials, such as the session token. It also exposes methods for registering
 * for a new account, signing into an existing one, or changing an account password.
 */
export declare class SNSessionManager extends PureService<SessionEvent> {
    private storageService;
    private apiService;
    private alertService;
    private protocolService;
    private challengeService;
    private webSocketsService;
    private user?;
    private isSessionRenewChallengePresented;
    constructor(storageService: SNStorageService, apiService: SNApiService, alertService: SNAlertService, protocolService: SNProtocolService, challengeService: ChallengeService, webSocketsService: SNWebSocketsService);
    deinit(): void;
    initializeFromDisk(): Promise<void>;
    private setSession;
    online(): boolean;
    offline(): boolean;
    getUser(): User | undefined;
    getSession(): Session | undefined;
    signOut(): Promise<void>;
    isSignedIn(): boolean;
    isSignedIntoFirstPartyServer(): boolean;
    reauthenticateInvalidSession(cancelable?: boolean, onResponse?: (response: HttpResponse) => void): Promise<void>;
    getSubscription(): Promise<HttpResponse | GetSubscriptionResponse>;
    private promptForMfaValue;
    register(email: string, password: string, ephemeral: boolean): Promise<SessionManagerResponse>;
    private retrieveKeyParams;
    signIn(email: string, password: string, strict?: boolean, ephemeral?: boolean, minAllowedVersion?: ProtocolVersion): Promise<SessionManagerResponse>;
    private performSignIn;
    bypassChecksAndSignInWithRootKey(email: string, rootKey: SNRootKey, mfaKeyPath?: string, mfaCode?: string, ephemeral?: boolean): Promise<SignInResponse | HttpResponse>;
    changeCredentials(parameters: {
        currentServerPassword: string;
        newRootKey: SNRootKey;
        wrappingKey?: SNRootKey;
        newEmail?: string;
    }): Promise<SessionManagerResponse>;
    getSessionsList(): Promise<(HttpResponse & {
        data: RemoteSession[];
    }) | HttpResponse>;
    revokeSession(sessionId: UuidString): Promise<HttpResponse>;
    revokeAllOtherSessions(): Promise<void>;
    private processChangeCredentialsResponse;
    private handleSuccessAuthResponse;
}
export {};

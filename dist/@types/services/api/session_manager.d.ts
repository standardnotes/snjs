import { SNProtocolService } from './../protocol_service';
import { SNApiService } from './api_service';
import { SNStorageService } from './../storage_service';
import { SNRootKey } from '../../protocol/root_key';
import { SNRootKeyParams } from './../../protocol/key_params';
import { HttpResponse } from './http_service';
import { PureService } from '../pure_service';
import { SNAlertService } from '../alert_service';
declare type SessionManagerResponse = {
    response: HttpResponse;
    keyParams: SNRootKeyParams;
    rootKey: SNRootKey;
};
declare type User = {
    uuid: string;
    email?: string;
};
/**
 * The session manager is responsible for loading initial user state, and any relevant
 * server credentials, such as the session token. It also exposes methods for registering
 * for a new account, signing into an existing one, or changing an account password.
 */
export declare class SNSessionManager extends PureService {
    private storageService?;
    private apiService?;
    private alertService?;
    private protocolService?;
    private user?;
    private session?;
    constructor(storageService: SNStorageService, apiService: SNApiService, alertService: SNAlertService, protocolService: SNProtocolService);
    deinit(): void;
    initializeFromDisk(): Promise<void>;
    private setSession;
    online(): boolean;
    offline(): boolean;
    getUser(): User | undefined;
    signOut(): Promise<void>;
    register(email: string, password: string): Promise<SessionManagerResponse>;
    signIn(email: string, password: string, strict?: boolean, mfaKeyPath?: string, mfaCode?: string): Promise<SessionManagerResponse>;
    changePassword(currentPassword: string, currentKeyParams: SNRootKeyParams, newPassword: string): Promise<SessionManagerResponse>;
    private handleAuthResponse;
    private newSessionFromResponse;
}
export {};

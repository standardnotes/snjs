import { ProtocolVersion } from '../../protocol/versions';
import { ChallengeService } from './../challenge/challenge_service';
import { SignInResponse, HttpResponse } from './responses';
import { SNProtocolService } from './../protocol_service';
import { SNApiService } from './api_service';
import { SNStorageService } from './../storage_service';
import { SNRootKey } from '../../protocol/root_key';
import { SNRootKeyParams, AnyKeyParamsContent } from './../../protocol/key_params';
import { PureService } from '../pure_service';
import { SNAlertService } from '../alert_service';
export declare const MINIMUM_PASSWORD_LENGTH = 8;
declare type SessionManagerResponse = {
    response: HttpResponse;
    rootKey?: SNRootKey;
    keyParams?: AnyKeyParamsContent;
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
    private storageService;
    private apiService;
    private alertService;
    private protocolService;
    private challengeService;
    private user?;
    constructor(storageService: SNStorageService, apiService: SNApiService, alertService: SNAlertService, protocolService: SNProtocolService, challengeService: ChallengeService);
    deinit(): void;
    initializeFromDisk(): Promise<void>;
    private setSession;
    online(): boolean;
    offline(): boolean;
    getUser(): User | undefined;
    signOut(): Promise<void>;
    private reauthenticateInvalidSession;
    promptForMfaValue(): Promise<string | undefined>;
    register(email: string, password: string): Promise<SessionManagerResponse>;
    signIn(email: string, password: string, strict?: boolean, minAllowedVersion?: ProtocolVersion): Promise<SessionManagerResponse>;
    bypassChecksAndSignInWithServerPassword(email: string, serverPassword: string, mfaKeyPath?: string, mfaCode?: string): Promise<SignInResponse>;
    changePassword(currentServerPassword: string, newServerPassword: string, newKeyParams: SNRootKeyParams): Promise<SessionManagerResponse>;
    private handleSuccessAuthResponse;
}
export {};

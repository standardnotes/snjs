import { UuidString } from './../../types';
import { ChangePasswordResponse, HttpResponse, StatusCode, KeyParamsResponse, RegistrationResponse, RevisionListEntry, RevisionListResponse, SessionRenewalResponse, SignInResponse, SingleRevisionResponse } from './responses';
import { Session } from './session';
import { ContentType } from '../../models/content_types';
import { PurePayload } from '../../protocol/payloads/pure_payload';
import { SNRootKeyParams } from './../../protocol/key_params';
import { SNStorageService } from './../storage_service';
import { SNHttpService } from './http_service';
import { PureService } from '../pure_service';
declare type InvalidSessionObserver = () => void;
export declare class SNApiService extends PureService {
    private httpService;
    private storageService;
    private host?;
    private session?;
    private registering;
    private authenticating;
    private changing;
    private refreshingSession;
    private invalidSessionObserver?;
    constructor(httpService: SNHttpService, storageService: SNStorageService, defaultHost?: string);
    /** @override */
    deinit(): void;
    /**
     * When a we receive a 401 error from the server, we'll notify the observer.
     * Note that this applies only to sessions that are totally invalid. Sessions that
     * are expired but can be renewed are still considered to be valid. In those cases,
     * the server response is 498.
     */
    setInvalidSessionObserver(observer: InvalidSessionObserver): void;
    loadHost(): Promise<void>;
    setHost(host: string): Promise<void>;
    getHost(): Promise<string | undefined>;
    setSession(session: Session, persist?: boolean): Promise<void>;
    getSession(): Session | undefined;
    private path;
    private params;
    createErrorResponse(message: string, status?: StatusCode): HttpResponse;
    private errorResponseWithFallbackMessage;
    /**
     * @param mfaKeyPath  The params path the server expects for authentication against
     *                    a particular mfa challenge. A value of foo would mean the server
     *                    would receive parameters as params['foo'] with value equal to mfaCode.
     * @param mfaCode     The mfa challenge response value.
     */
    getAccountKeyParams(email: string, mfaKeyPath?: string, mfaCode?: string): Promise<KeyParamsResponse>;
    register(email: string, serverPassword: string, keyParams: SNRootKeyParams): Promise<RegistrationResponse>;
    signIn(email: string, serverPassword: string, mfaKeyPath?: string, mfaCode?: string): Promise<SignInResponse>;
    signOut(): Promise<HttpResponse>;
    changePassword(currentServerPassword: string, newServerPassword: string, newKeyParams: SNRootKeyParams): Promise<ChangePasswordResponse>;
    sync(payloads: PurePayload[], lastSyncToken: string, paginationToken: string, limit: number, checkIntegrity?: boolean, contentType?: ContentType, customEvent?: string): Promise<any>;
    private refreshSessionThenRetryRequest;
    refreshSession(): Promise<SessionRenewalResponse>;
    getSessionsList(): Promise<HttpResponse>;
    getItemRevisions(itemId: UuidString): Promise<RevisionListResponse | HttpResponse>;
    getRevision(entry: RevisionListEntry, itemId: UuidString): Promise<SingleRevisionResponse | HttpResponse>;
    private preprocessingError;
    /** Handle errored responses to authenticated requests */
    private preprocessAuthenticatedErrorResponse;
}
export {};

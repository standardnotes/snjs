import { SNFeatureRepo } from './../../models/app/feature_repo';
import { ErrorObject, UuidString } from './../../types';
import { HttpResponse, RegistrationResponse, RevisionListEntry, RevisionListResponse, SessionRenewalResponse, SignInResponse, SignOutResponse, SingleRevisionResponse, StatusCode, KeyParamsResponse, SessionListResponse, RawSyncResponse, UserFeaturesResponse, ListSettingsResponse, UpdateSettingResponse, GetSettingResponse, DeleteSettingResponse, GetSubscriptionResponse, GetAvailableSubscriptionsResponse, ChangeCredentialsResponse } from './responses';
import { Session } from './session';
import { ContentType } from '../../models/content_types';
import { PurePayload } from '../../protocol/payloads/pure_payload';
import { SNRootKeyParams } from './../../protocol/key_params';
import { SNStorageService } from './../storage_service';
import { SNHttpService } from './http_service';
import { PureService } from '../pure_service';
import { Role } from '@standardnotes/auth';
import { FeatureDescription } from '@standardnotes/features';
declare type InvalidSessionObserver = (revoked: boolean) => void;
export declare enum ApiServiceEvent {
    MetaReceived = "MetaReceived"
}
export declare type MetaReceivedData = {
    userUuid: UuidString;
    userRoles: Role[];
};
export declare class SNApiService extends PureService<ApiServiceEvent.MetaReceived, MetaReceivedData> {
    private httpService;
    private storageService;
    private host;
    private session?;
    private registering;
    private authenticating;
    private changing;
    private refreshingSession;
    private invalidSessionObserver?;
    constructor(httpService: SNHttpService, storageService: SNStorageService, host: string);
    /** @override */
    deinit(): void;
    /**
     * When a we receive a 401 error from the server, we'll notify the observer.
     * Note that this applies only to sessions that are totally invalid. Sessions that
     * are expired but can be renewed are still considered to be valid. In those cases,
     * the server response is 498.
     * If the session has been revoked, then the observer will have its first
     * argument set to true.
     */
    setInvalidSessionObserver(observer: InvalidSessionObserver): void;
    loadHost(): Promise<void>;
    setHost(host: string): Promise<void>;
    getHost(): string;
    isThirdPartyHostUsed(): boolean;
    setSession(session: Session, persist?: boolean): Promise<void>;
    getSession(): Session | undefined;
    /** Exposes apiVersion to tests */
    private get apiVersion();
    private params;
    createErrorResponse(message: string, status?: StatusCode): HttpResponse;
    private errorResponseWithFallbackMessage;
    private processMetaObject;
    private processResponse;
    private request;
    /**
     * @param mfaKeyPath  The params path the server expects for authentication against
     *                    a particular mfa challenge. A value of foo would mean the server
     *                    would receive parameters as params['foo'] with value equal to mfaCode.
     * @param mfaCode     The mfa challenge response value.
     */
    getAccountKeyParams(email: string, mfaKeyPath?: string, mfaCode?: string): Promise<KeyParamsResponse | HttpResponse>;
    register(email: string, serverPassword: string, keyParams: SNRootKeyParams, ephemeral: boolean): Promise<RegistrationResponse | HttpResponse>;
    signIn(email: string, serverPassword: string, mfaKeyPath?: string, mfaCode?: string, ephemeral?: boolean): Promise<SignInResponse | HttpResponse>;
    signOut(): Promise<SignOutResponse>;
    changeCredentials(parameters: {
        userUuid: UuidString;
        currentServerPassword: string;
        newServerPassword: string;
        newKeyParams: SNRootKeyParams;
        newEmail?: string;
    }): Promise<ChangeCredentialsResponse | HttpResponse>;
    sync(payloads: PurePayload[], lastSyncToken: string, paginationToken: string, limit: number, checkIntegrity?: boolean, contentType?: ContentType, customEvent?: string): Promise<RawSyncResponse | HttpResponse>;
    private refreshSessionThenRetryRequest;
    refreshSession(): Promise<SessionRenewalResponse | HttpResponse>;
    getSessionsList(): Promise<SessionListResponse | HttpResponse>;
    deleteSession(sessionId: UuidString): Promise<HttpResponse>;
    getItemRevisions(itemId: UuidString): Promise<RevisionListResponse | HttpResponse>;
    getRevision(entry: RevisionListEntry, itemId: UuidString): Promise<SingleRevisionResponse | HttpResponse>;
    getUserFeatures(userUuid: UuidString): Promise<HttpResponse | UserFeaturesResponse>;
    private tokenRefreshableRequest;
    listSettings(userUuid: UuidString): Promise<ListSettingsResponse>;
    updateSetting(userUuid: UuidString, settingName: string, settingValue: string | null, sensitive: boolean): Promise<UpdateSettingResponse>;
    getSetting(userUuid: UuidString, settingName: string): Promise<GetSettingResponse>;
    deleteSetting(userUuid: UuidString, settingName: string): Promise<DeleteSettingResponse>;
    downloadFeatureUrl(url: string): Promise<HttpResponse>;
    getSubscription(userUuid: string): Promise<HttpResponse | GetSubscriptionResponse>;
    getAvailableSubscriptions(): Promise<HttpResponse | GetAvailableSubscriptionsResponse>;
    getNewSubscriptionToken(): Promise<string | undefined>;
    downloadOfflineFeaturesFromRepo(repo: SNFeatureRepo): Promise<{
        features: FeatureDescription[];
    } | ErrorObject>;
    private preprocessingError;
    /** Handle errored responses to authenticated requests */
    private preprocessAuthenticatedErrorResponse;
}
export {};

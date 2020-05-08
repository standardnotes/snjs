import { Session } from './session';
import { ContentType } from '../../models/content_types';
import { PurePayload } from '../../protocol/payloads/pure_payload';
import { SNRootKeyParams } from './../../protocol/key_params';
import { SNStorageService } from './../storage_service';
import { SNHttpService, HttpResponse } from './http_service';
import { PureService } from '../pure_service';
export declare class SNApiService extends PureService {
    private httpService?;
    private storageService?;
    private host?;
    private session?;
    private registering;
    private authenticating;
    private changing;
    private refreshingSession;
    constructor(httpService: SNHttpService, storageService: SNStorageService);
    /** @override */
    deinit(): void;
    loadHost(): Promise<void>;
    setHost(host: string): Promise<void>;
    getHost(): Promise<string | undefined>;
    setSession(session: Session): void;
    private path;
    private params;
    createErrorResponse(message: string): HttpResponse;
    private errorResponseWithFallbackMessage;
    /**
     * @param mfaKeyPath  The params path the server expects for authentication against
     *                    a particular mfa challenge. A value of foo would mean the server
     *                    would receive parameters as params['foo'] with value equal to mfaCode.
     * @param mfaCode     The mfa challenge response value.
     */
    getAccountKeyParams(email: string, mfaKeyPath?: string, mfaCode?: string): Promise<HttpResponse>;
    register(email: string, serverPassword: string, keyParams: SNRootKeyParams): Promise<HttpResponse>;
    signIn(email: string, serverPassword: string, mfaKeyPath?: string, mfaCode?: string): Promise<HttpResponse>;
    signOut(): Promise<void>;
    changePassword(currentServerPassword: string, newServerPassword: string, newKeyParams: SNRootKeyParams): Promise<HttpResponse>;
    sync(payloads: PurePayload[], lastSyncToken: string, paginationToken: string, limit: number, checkIntegrity?: boolean, contentType?: ContentType, customEvent?: string): Promise<HttpResponse>;
    private checkForExpiredAccessToken;
    private refreshSession;
    private newSessionFromResponse;
}

import { SNFeatureRepo } from './../../models/app/feature_repo';
import { UuidString } from './../../types';
import {
  HttpResponse,
  RegistrationResponse,
  RevisionListEntry,
  RevisionListResponse,
  SessionRenewalResponse,
  SignInResponse,
  SignOutResponse,
  SingleRevisionResponse,
  StatusCode,
  isErrorResponseExpiredToken,
  ResponseMeta,
  KeyParamsResponse,
  SessionListResponse,
  RawSyncResponse,
  UserFeaturesResponse,
  ListSettingsResponse,
  UpdateSettingResponse,
  GetSettingResponse,
  DeleteSettingResponse,
  MinimalHttpResponse,
  GetSubscriptionResponse,
  GetAvailableSubscriptionsResponse,
  ChangeCredentialsResponse,
  PostSubscriptionTokensResponse,
  GetOfflineFeaturesResponse,
  ListedRegistrationResponse,
  User,
} from './responses';
import { Session, TokenSession } from './session';
import { ContentType, ErrorObject } from '@standardnotes/common';
import { PurePayload } from '@Payloads/pure_payload';
import { SNRootKeyParams } from './../../protocol/key_params';
import { SNStorageService } from './../storage_service';
import {
  ErrorTag,
  HttpParams,
  HttpRequest,
  HttpVerb,
  SNHttpService,
} from './http_service';
import merge from 'lodash/merge';
import { ApiEndpointParam } from '@Services/api/keys';
import * as messages from '@Services/api/messages';
import { isNullOrUndefined, joinPaths } from '@standardnotes/utils';
import { StorageKey } from '@Lib/storage_keys';
import { Role } from '@standardnotes/auth';
import { FeatureDescription } from '@standardnotes/features';
import { API_MESSAGE_FAILED_OFFLINE_ACTIVATION } from '@Services/api/messages';
import { isUrlFirstParty, TRUSTED_FEATURE_HOSTS } from '@Lib/hosts';
import { AbstractService } from '@standardnotes/services';

type PathNamesV1 = {
  keyParams: string;
  register: string;
  signIn: string;
  changeCredentials: (userUuid: string) => string;
  sync: string;
  signOut: string;
  refreshSession: string;
  sessions: string;
  session: (sessionUuid: string) => string;
  itemRevisions: (itemId: string) => string;
  itemRevision: (itemId: string, revisionId: string) => string;
  userFeatures: (userUuid: string) => string;
  settings: (userUuid: string) => string;
  setting: (userUuid: string, settingName: string) => string;
  subscription: (userUuid: string) => string;
  listedRegistration: (userUuid: string) => string;
  purchase: string;
  subscriptionTokens: string;
  offlineFeatures: string;
};

type PathNamesV2 = {
  subscriptions: string;
};

const Paths: {
  v1: PathNamesV1;
  v2: PathNamesV2;
} = {
  v1: {
    keyParams: '/v1/login-params',
    register: '/v1/users',
    signIn: '/v1/login',
    changeCredentials: (userUuid: string) =>
      `/v1/users/${userUuid}/attributes/credentials`,
    sync: '/v1/items',
    signOut: '/v1/logout',
    refreshSession: '/v1/sessions/refresh',
    sessions: '/v1/sessions',
    session: (sessionUuid: string) => `/v1/sessions/${sessionUuid}`,
    itemRevisions: (itemUuid: string) => `/v1/items/${itemUuid}/revisions`,
    itemRevision: (itemUuid: string, revisionUuid: string) =>
      `/v1/items/${itemUuid}/revisions/${revisionUuid}`,
    userFeatures: (userUuid: string) => `/v1/users/${userUuid}/features`,
    settings: (userUuid) => `/v1/users/${userUuid}/settings`,
    setting: (userUuid, settingName) =>
      `/v1/users/${userUuid}/settings/${settingName}`,
    subscription: (userUuid) => `/v1/users/${userUuid}/subscription`,
    listedRegistration: (userUuid: string) =>
      `/v1/users/${userUuid}/integrations/listed`,
    purchase: '/v1/purchase',
    subscriptionTokens: '/v1/subscription-tokens',
    offlineFeatures: '/v1/offline/features',
  },
  v2: {
    subscriptions: '/v2/subscriptions',
  },
};

/** Legacy api version field to be specified in params when calling v0 APIs. */
const V0_API_VERSION = '20200115';

type InvalidSessionObserver = (revoked: boolean) => void;

export enum ApiServiceEvent {
  MetaReceived = 'MetaReceived',
}

export type MetaReceivedData = {
  userUuid: UuidString;
  userRoles: Role[];
};

export class SNApiService extends AbstractService<
  ApiServiceEvent.MetaReceived,
  MetaReceivedData
> {
  private session?: Session;
  public user?: User;
  private registering = false;
  private authenticating = false;
  private changing = false;
  private refreshingSession = false;

  private invalidSessionObserver?: InvalidSessionObserver;

  constructor(
    private httpService: SNHttpService,
    private storageService: SNStorageService,
    private host: string
  ) {
    super();
  }

  /** @override */
  deinit(): void {
    (this.httpService as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    this.invalidSessionObserver = undefined;
    this.session = undefined;
    super.deinit();
  }

  public setUser(user?: User): void {
    this.user = user;
  }

  /**
   * When a we receive a 401 error from the server, we'll notify the observer.
   * Note that this applies only to sessions that are totally invalid. Sessions that
   * are expired but can be renewed are still considered to be valid. In those cases,
   * the server response is 498.
   * If the session has been revoked, then the observer will have its first
   * argument set to true.
   */
  public setInvalidSessionObserver(observer: InvalidSessionObserver): void {
    this.invalidSessionObserver = observer;
  }

  public async loadHost(): Promise<void> {
    const storedValue = await this.storageService.getValue(
      StorageKey.ServerHost
    );
    this.host =
      storedValue ||
      this.host ||
      (window as {
        _default_sync_server?: string;
      })._default_sync_server;
  }

  public async setHost(host: string): Promise<void> {
    this.host = host;
    await this.storageService.setValue(StorageKey.ServerHost, host);
  }

  public getHost(): string {
    return this.host;
  }

  public isThirdPartyHostUsed(): boolean {
    const applicationHost = this.getHost() || '';
    return !isUrlFirstParty(applicationHost);
  }

  public async setSession(session: Session, persist = true): Promise<void> {
    this.session = session;
    if (persist) {
      await this.storageService.setValue(StorageKey.Session, session);
    }
  }

  public getSession(): Session | undefined {
    return this.session;
  }

  /** Exposes apiVersion to tests */
  private get apiVersion() {
    return V0_API_VERSION;
  }

  private params(
    inParams: Record<string | number | symbol, unknown>
  ): HttpParams {
    const params = merge(inParams, {
      [ApiEndpointParam.ApiVersion]: this.apiVersion,
    });
    return params;
  }

  public createErrorResponse(
    message: string,
    status?: StatusCode
  ): HttpResponse {
    return { error: { message, status } } as HttpResponse;
  }

  private errorResponseWithFallbackMessage(
    response: HttpResponse,
    message: string
  ) {
    if (!response.error?.message) {
      response.error = {
        ...response.error,
        status: response.error?.status ?? StatusCode.UnknownError,
        message,
      };
    }
    return response;
  }

  private processMetaObject(meta: ResponseMeta) {
    if (meta.auth && meta.auth.userUuid && meta.auth.roles) {
      this.notifyEvent(ApiServiceEvent.MetaReceived, {
        userUuid: meta.auth.userUuid,
        userRoles: meta.auth.roles,
      });
    }
  }

  private processResponse(response: HttpResponse) {
    if (response.meta) {
      this.processMetaObject(response.meta);
    }
  }

  private async request(params: {
    verb: HttpVerb;
    url: string;
    fallbackErrorMessage: string;
    params?: HttpParams;
    authentication?: string;
    customHeaders?: Record<string, string>[];
  }) {
    try {
      const response = await this.httpService.runHttp(params);
      this.processResponse(response);
      return response;
    } catch (errorResponse) {
      return this.errorResponseWithFallbackMessage(
        errorResponse as HttpResponse,
        params.fallbackErrorMessage
      );
    }
  }

  /**
   * @param mfaKeyPath  The params path the server expects for authentication against
   *                    a particular mfa challenge. A value of foo would mean the server
   *                    would receive parameters as params['foo'] with value equal to mfaCode.
   * @param mfaCode     The mfa challenge response value.
   */
  getAccountKeyParams(
    email: string,
    mfaKeyPath?: string,
    mfaCode?: string
  ): Promise<KeyParamsResponse | HttpResponse> {
    const params = this.params({
      email: email,
    });
    if (mfaKeyPath && mfaCode) {
      params[mfaKeyPath] = mfaCode;
    }
    return this.request({
      verb: HttpVerb.Get,
      url: joinPaths(this.host, Paths.v1.keyParams),
      fallbackErrorMessage: messages.API_MESSAGE_GENERIC_INVALID_LOGIN,
      params,
      /** A session is optional here, if valid, endpoint returns extra params */
      authentication: this.session?.authorizationValue,
    });
  }

  async register(
    email: string,
    serverPassword: string,
    keyParams: SNRootKeyParams,
    ephemeral: boolean
  ): Promise<RegistrationResponse | HttpResponse> {
    if (this.registering) {
      return this.createErrorResponse(
        messages.API_MESSAGE_REGISTRATION_IN_PROGRESS
      ) as RegistrationResponse;
    }
    this.registering = true;
    const url = joinPaths(this.host, Paths.v1.register);
    const params = this.params({
      password: serverPassword,
      email,
      ephemeral,
      ...keyParams.getPortableValue(),
    });
    const response = await this.request({
      verb: HttpVerb.Post,
      url,
      fallbackErrorMessage: messages.API_MESSAGE_GENERIC_REGISTRATION_FAIL,
      params,
    });
    this.registering = false;
    return response;
  }

  async signIn(
    email: string,
    serverPassword: string,
    mfaKeyPath?: string,
    mfaCode?: string,
    ephemeral = false
  ): Promise<SignInResponse | HttpResponse> {
    if (this.authenticating) {
      return this.createErrorResponse(
        messages.API_MESSAGE_LOGIN_IN_PROGRESS
      ) as SignInResponse;
    }
    this.authenticating = true;
    const url = joinPaths(this.host, Paths.v1.signIn);
    const params = this.params({
      email,
      password: serverPassword,
      ephemeral,
    });
    if (mfaKeyPath && mfaCode) {
      params[mfaKeyPath] = mfaCode;
    }
    const response = await this.request({
      verb: HttpVerb.Post,
      url,
      params,
      fallbackErrorMessage: messages.API_MESSAGE_GENERIC_INVALID_LOGIN,
    });

    this.authenticating = false;
    return response;
  }

  signOut(): Promise<SignOutResponse> {
    const url = joinPaths(this.host, Paths.v1.signOut);
    return this.httpService
      .postAbsolute(url, undefined, this.session!.authorizationValue)
      .catch((errorResponse) => {
        return errorResponse;
      }) as Promise<SignOutResponse>;
  }

  async changeCredentials(parameters: {
    userUuid: UuidString;
    currentServerPassword: string;
    newServerPassword: string;
    newKeyParams: SNRootKeyParams;
    newEmail?: string;
  }): Promise<ChangeCredentialsResponse | HttpResponse> {
    if (this.changing) {
      return this.createErrorResponse(
        messages.API_MESSAGE_CHANGE_CREDENTIALS_IN_PROGRESS
      );
    }
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    this.changing = true;
    const url = joinPaths(
      this.host,
      Paths.v1.changeCredentials(parameters.userUuid) as string
    );
    const params = this.params({
      current_password: parameters.currentServerPassword,
      new_password: parameters.newServerPassword,
      new_email: parameters.newEmail,
      ...parameters.newKeyParams.getPortableValue(),
    });
    const response = await this.httpService
      .putAbsolute(url, params, this.session!.authorizationValue)
      .catch(async (errorResponse) => {
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest({
            verb: HttpVerb.Put,
            url,
            params,
          });
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_CHANGE_CREDENTIALS_FAIL
        );
      });

    this.processResponse(response);

    this.changing = false;
    return response;
  }

  async sync(
    payloads: PurePayload[],
    lastSyncToken: string,
    paginationToken: string,
    limit: number,
    checkIntegrity = false,
    contentType?: ContentType,
    customEvent?: string
  ): Promise<RawSyncResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = joinPaths(this.host, Paths.v1.sync);
    const params = this.params({
      [ApiEndpointParam.SyncPayloads]: payloads.map((p) => p.ejected()),
      [ApiEndpointParam.LastSyncToken]: lastSyncToken,
      [ApiEndpointParam.PaginationToken]: paginationToken,
      [ApiEndpointParam.IntegrityCheck]: checkIntegrity,
      [ApiEndpointParam.SyncDlLimit]: limit,
      content_type: contentType,
      event: customEvent,
    });
    const response = await this.httpService
      .postAbsolute(url, params, this.session!.authorizationValue)
      .catch<HttpResponse>(async (errorResponse) => {
        this.preprocessAuthenticatedErrorResponse(errorResponse);
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest({
            verb: HttpVerb.Post,
            url,
            params,
          });
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_SYNC_FAIL
        );
      });
    this.processResponse(response);

    return response;
  }

  private async refreshSessionThenRetryRequest(
    httpRequest: HttpRequest
  ): Promise<HttpResponse> {
    const sessionResponse = await this.refreshSession();
    if (sessionResponse.error || isNullOrUndefined(sessionResponse.data)) {
      return sessionResponse;
    } else {
      return this.httpService
        .runHttp({
          ...httpRequest,
          authentication: this.session!.authorizationValue,
        })
        .catch((errorResponse) => {
          return errorResponse;
        });
    }
  }

  async refreshSession(): Promise<SessionRenewalResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    this.refreshingSession = true;
    const url = joinPaths(this.host, Paths.v1.refreshSession);
    const session = this.session! as TokenSession;
    const params = this.params({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });
    const result = await this.httpService
      .postAbsolute(url, params)
      .then(async (response) => {
        const session = TokenSession.FromApiResponse(
          response as SessionRenewalResponse
        );
        await this.setSession(session);
        this.processResponse(response);
        return response;
      })
      .catch((errorResponse) => {
        this.preprocessAuthenticatedErrorResponse(errorResponse);
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_TOKEN_REFRESH_FAIL
        );
      });
    this.refreshingSession = false;
    return result;
  }

  async getSessionsList(): Promise<SessionListResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = joinPaths(this.host, Paths.v1.sessions);
    const response = await this.httpService
      .getAbsolute(url, {}, this.session!.authorizationValue)
      .catch(async (errorResponse) => {
        this.preprocessAuthenticatedErrorResponse(errorResponse);
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest({
            verb: HttpVerb.Get,
            url,
          });
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_SYNC_FAIL
        );
      });
    this.processResponse(response);

    return response;
  }

  async deleteSession(sessionId: UuidString): Promise<HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = joinPaths(this.host, <string>Paths.v1.session(sessionId));
    const response:
      | RevisionListResponse
      | HttpResponse = await this.httpService
      .deleteAbsolute(
        url,
        { uuid: sessionId },
        this.session!.authorizationValue
      )
      .catch((error: HttpResponse) => {
        const errorResponse = error as HttpResponse;
        this.preprocessAuthenticatedErrorResponse(errorResponse);
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest({
            verb: HttpVerb.Delete,
            url,
          });
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_SYNC_FAIL
        );
      });
    this.processResponse(response);
    return response;
  }

  async getItemRevisions(
    itemId: UuidString
  ): Promise<RevisionListResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = joinPaths(this.host, Paths.v1.itemRevisions(itemId));
    const response:
      | RevisionListResponse
      | HttpResponse = await this.httpService
      .getAbsolute(url, undefined, this.session!.authorizationValue)
      .catch((errorResponse: HttpResponse) => {
        this.preprocessAuthenticatedErrorResponse(errorResponse);
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest({
            verb: HttpVerb.Get,
            url,
          });
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_SYNC_FAIL
        );
      });
    this.processResponse(response);
    return response;
  }

  async getRevision(
    entry: RevisionListEntry,
    itemId: UuidString
  ): Promise<SingleRevisionResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = joinPaths(this.host, Paths.v1.itemRevision(itemId, entry.uuid));
    const response:
      | SingleRevisionResponse
      | HttpResponse = await this.httpService
      .getAbsolute(url, undefined, this.session!.authorizationValue)
      .catch((errorResponse: HttpResponse) => {
        this.preprocessAuthenticatedErrorResponse(errorResponse);
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest({
            verb: HttpVerb.Get,
            url,
          });
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_SYNC_FAIL
        );
      });
    this.processResponse(response);
    return response;
  }

  async getUserFeatures(
    userUuid: UuidString
  ): Promise<HttpResponse | UserFeaturesResponse> {
    const url = joinPaths(this.host, Paths.v1.userFeatures(userUuid));
    const response = await this.httpService
      .getAbsolute(url, undefined, this.session!.authorizationValue)
      .catch((errorResponse: HttpResponse) => {
        this.preprocessAuthenticatedErrorResponse(errorResponse);
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest({
            verb: HttpVerb.Get,
            url,
          });
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_SYNC_FAIL
        );
      });
    this.processResponse(response);
    return response;
  }

  private async tokenRefreshableRequest<T extends MinimalHttpResponse>(
    params: HttpRequest & { fallbackErrorMessage: string }
  ): Promise<T> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError as T;
    }
    const response: T | HttpResponse = await this.httpService
      .runHttp(params)
      .catch((errorResponse: HttpResponse) => {
        this.preprocessAuthenticatedErrorResponse(errorResponse);
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest(params);
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          params.fallbackErrorMessage
        );
      });
    this.processResponse(response);
    return response as T;
  }

  async listSettings(userUuid: UuidString): Promise<ListSettingsResponse> {
    return await this.tokenRefreshableRequest<ListSettingsResponse>({
      verb: HttpVerb.Get,
      url: joinPaths(this.host, Paths.v1.settings(userUuid)),
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_GET_SETTINGS,
      authentication: this.session?.authorizationValue,
    });
  }

  async updateSetting(
    userUuid: UuidString,
    settingName: string,
    settingValue: string | null,
    sensitive: boolean
  ): Promise<UpdateSettingResponse> {
    const params = {
      name: settingName,
      value: settingValue,
      sensitive: sensitive,
    };
    return this.tokenRefreshableRequest<UpdateSettingResponse>({
      verb: HttpVerb.Put,
      url: joinPaths(this.host, Paths.v1.settings(userUuid)),
      authentication: this.session?.authorizationValue,
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_UPDATE_SETTINGS,
      params,
    });
  }

  async getSetting(
    userUuid: UuidString,
    settingName: string
  ): Promise<GetSettingResponse> {
    return await this.tokenRefreshableRequest<GetSettingResponse>({
      verb: HttpVerb.Get,
      url: joinPaths(
        this.host,
        Paths.v1.setting(userUuid, settingName.toLowerCase())
      ),
      authentication: this.session?.authorizationValue,
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_GET_SETTINGS,
    });
  }

  async deleteSetting(
    userUuid: UuidString,
    settingName: string
  ): Promise<DeleteSettingResponse> {
    return this.tokenRefreshableRequest<DeleteSettingResponse>({
      verb: HttpVerb.Delete,
      url: joinPaths(this.host, Paths.v1.setting(userUuid, settingName)),
      authentication: this.session?.authorizationValue,
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_UPDATE_SETTINGS,
    });
  }

  async deleteRevision(
    itemUuid: UuidString,
    entry: RevisionListEntry
  ): Promise<MinimalHttpResponse> {
    const url = joinPaths(
      this.host,
      Paths.v1.itemRevision(itemUuid, entry.uuid)
    );
    const response = await this.tokenRefreshableRequest({
      verb: HttpVerb.Delete,
      url,
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_DELETE_REVISION,
      authentication: this.session?.authorizationValue,
    });
    return response;
  }

  public downloadFeatureUrl(url: string): Promise<HttpResponse> {
    return this.request({
      verb: HttpVerb.Get,
      url,
      fallbackErrorMessage: messages.API_MESSAGE_GENERIC_INVALID_LOGIN,
    });
  }

  public async getSubscription(
    userUuid: string
  ): Promise<HttpResponse | GetSubscriptionResponse> {
    const url = joinPaths(this.host, Paths.v1.subscription(userUuid));
    const response = await this.request({
      verb: HttpVerb.Get,
      url,
      authentication: this.session?.authorizationValue,
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_SUBSCRIPTION_INFO,
    });
    return response;
  }

  public async getAvailableSubscriptions(): Promise<
    HttpResponse | GetAvailableSubscriptionsResponse
  > {
    const url = joinPaths(this.host, Paths.v2.subscriptions);
    const response = await this.request({
      verb: HttpVerb.Get,
      url,
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_SUBSCRIPTION_INFO,
    });
    return response;
  }

  public async getNewSubscriptionToken(): Promise<string | undefined> {
    const url = joinPaths(this.host, Paths.v1.subscriptionTokens);
    const response:
      | HttpResponse
      | PostSubscriptionTokensResponse = await this.request({
      verb: HttpVerb.Post,
      url,
      authentication: this.session?.authorizationValue,
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_ACCESS_PURCHASE,
    });
    return (response as PostSubscriptionTokensResponse).data?.token;
  }

  public async downloadOfflineFeaturesFromRepo(
    repo: SNFeatureRepo
  ): Promise<{ features: FeatureDescription[] } | ErrorObject> {
    try {
      const featuresUrl = repo.offlineFeaturesUrl;
      const extensionKey = repo.offlineKey;
      const { host } = new URL(featuresUrl);
      if (!TRUSTED_FEATURE_HOSTS.includes(host)) {
        return {
          error: 'This offline features host is not in the trusted allowlist.',
        };
      }
      const response:
        | HttpResponse
        | GetOfflineFeaturesResponse = await this.request({
        verb: HttpVerb.Get,
        url: featuresUrl,
        fallbackErrorMessage: messages.API_MESSAGE_FAILED_OFFLINE_FEATURES,
        customHeaders: [{ key: 'x-offline-token', value: extensionKey }],
      });
      if (response.error) {
        return { error: response.error.message };
      }
      return {
        features: (response as GetOfflineFeaturesResponse).data?.features || [],
      };
    } catch {
      return {
        error: API_MESSAGE_FAILED_OFFLINE_ACTIVATION,
      };
    }
  }

  public async registerForListedAccount(): Promise<ListedRegistrationResponse> {
    if (!this.user) {
      throw Error('Cannot register for Listed without user account.');
    }
    return await this.tokenRefreshableRequest<ListedRegistrationResponse>({
      verb: HttpVerb.Post,
      url: joinPaths(this.host, Paths.v1.listedRegistration(this.user.uuid)),
      fallbackErrorMessage: messages.API_MESSAGE_FAILED_LISTED_REGISTRATION,
      authentication: this.session?.authorizationValue,
    });
  }

  private preprocessingError() {
    if (this.refreshingSession) {
      return this.createErrorResponse(
        messages.API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS
      );
    }
    if (!this.session) {
      return this.createErrorResponse(messages.API_MESSAGE_INVALID_SESSION);
    }
    return undefined;
  }

  /** Handle errored responses to authenticated requests */
  private preprocessAuthenticatedErrorResponse(response: HttpResponse) {
    if (
      response.status === StatusCode.HttpStatusInvalidSession &&
      this.session
    ) {
      this.invalidSessionObserver?.(
        response.error?.tag === ErrorTag.RevokedSession
      );
    }
  }
}

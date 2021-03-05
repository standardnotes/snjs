import { UuidString } from './../../types';
import {
  ChangePasswordResponse,
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
} from './responses';
import { RemoteSession, Session, TokenSession } from './session';
import { ContentType } from '@Models/content_types';
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
import { PureService } from '@Services/pure_service';
import { joinPaths } from '@Lib/utils';
import { StorageKey } from '@Lib/storage_keys';
import { SNPermissionsService } from '../permissions_service';

const enum Path {
  KeyParams,
  Register,
  Login,
  ChangePassword,
  Sync,
  Logout,
  SessionRefresh,
  Sessions,
  Session,
  ItemRevisions,
  ItemRevision,
}

const enum ApiVersion {
  V0,
  V1,
}

type VersionedPaths = {
  [key in Path]: {
    [key in ApiVersion]: string
  }
}

const Paths: VersionedPaths = {
  [Path.KeyParams]: {
    [ApiVersion.V0]: '/auth/params',
    [ApiVersion.V1]: '/auth/params'
  },
  [Path.Sessions]: {
    [ApiVersion.V0]: '/sessions',
    [ApiVersion.V1]: '/v1/sessions',
  },
  [Path.Register]: {
    [ApiVersion.V0]: '/auth',
    [ApiVersion.V1]: '/auth',
  },
  [Path.Login]: {
    [ApiVersion.V0]: '/auth/sign_in',
    [ApiVersion.V1]: '/auth/sign_in',
  },
  [Path.ChangePassword]: {
    [ApiVersion.V0]: '/auth/change_pw',
    [ApiVersion.V1]: '/auth/change_pw',
  },
  [Path.Sync]: {
    [ApiVersion.V0]: '/items/sync',
    [ApiVersion.V1]: '/items/sync',
  },
  [Path.Logout]: {
    [ApiVersion.V0]: '/auth/sign_out',
    [ApiVersion.V1]: '/auth/sign_out',
  },
  [Path.SessionRefresh]: {
    [ApiVersion.V0]: '/session/refresh',
    [ApiVersion.V1]: '/session/refresh',
  },
  [Path.Sessions]: {
    [ApiVersion.V0]: '/sessions',
    [ApiVersion.V1]: '/sessions',
  },
  [Path.Session]: {
    [ApiVersion.V0]: '/session',
    [ApiVersion.V1]: '/session',
  },
  [Path.ItemRevisions]: {
    [ApiVersion.V0]: '/items/:item_id/revisions',
    [ApiVersion.V1]: '/items/:item_id/revisions',
  },
  [Path.ItemRevision]: {
    [ApiVersion.V0]: '/items/:item_id/revisions/:id',
    [ApiVersion.V1]: '/items/:item_id/revisions/:id',
  },
}

const V0_API_VERSION = '20200115';

type InvalidSessionObserver = (revoked: boolean) => void;

export class SNApiService extends PureService {
  private session?: Session;

  private registering = false;
  private authenticating = false;
  private changing = false;
  private refreshingSession = false;

  private invalidSessionObserver?: InvalidSessionObserver;

  constructor(
    private httpService: SNHttpService,
    private storageService: SNStorageService,
    private permissionsService: SNPermissionsService,
    private host?: string
  ) {
    super();
  }

  /** @override */
  deinit(): void {
    (this.httpService as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    this.invalidSessionObserver = undefined;
    this.host = undefined;
    this.session = undefined;
    super.deinit();
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
      storedValue || this.host || (window as any)._default_sync_server;
  }

  public async setHost(host: string): Promise<void> {
    this.host = host;
    await this.storageService.setValue(StorageKey.ServerHost, host);
  }

  public getHost(): string | undefined {
    return this.host;
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

  private path(path: Path, version = ApiVersion.V0) {
    const host = this.getHost();
    if (!host) {
      throw Error(`Attempting to build path ${path} with no host.`);
    }
    if (!path) {
      throw Error('Attempting to build path with null path.');
    }
    return joinPaths(host, Paths[path][version]);
  }

  private params(inParams: any): HttpParams {
    const params = merge(inParams, {
      [ApiEndpointParam.ApiVersion]: V0_API_VERSION,
    });
    return params;
  }

  public createErrorResponse<T = unknown>(
    message: string,
    status?: StatusCode
  ): HttpResponse<T> {
    return { error: { message, status } } as HttpResponse<T>;
  }

  private errorResponseWithFallbackMessage(
    response: HttpResponse,
    message: string
  ) {
    if (!response.error!.message) {
      response.error!.message = message;
    }
    return response;
  }

  private processMetaObject(meta: ResponseMeta) {
    this.permissionsService.update(meta.auth.role, meta.auth.permissions);
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
  }) {
    try {
      const response = await this.httpService.runHttp(params);
      this.processResponse(response);
      return response;
    } catch (errorResponse) {
      return this.errorResponseWithFallbackMessage(
        errorResponse,
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
  ): Promise<HttpResponse> {
    const params = this.params({
      email: email,
    });
    if (mfaKeyPath && mfaCode) {
      params[mfaKeyPath] = mfaCode;
    }
    return this.request({
      verb: HttpVerb.Get,
      url: this.path(Path.KeyParams),
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
  ): Promise<RegistrationResponse> {
    if (this.registering) {
      return this.createErrorResponse(
        messages.API_MESSAGE_REGISTRATION_IN_PROGRESS
      ) as RegistrationResponse;
    }
    this.registering = true;
    const url = this.path(Path.Register);
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
    return response as RegistrationResponse;
  }

  async signIn(
    email: string,
    serverPassword: string,
    mfaKeyPath?: string,
    mfaCode?: string,
    ephemeral = false
  ): Promise<SignInResponse> {
    if (this.authenticating) {
      return this.createErrorResponse(
        messages.API_MESSAGE_LOGIN_IN_PROGRESS
      ) as SignInResponse;
    }
    this.authenticating = true;
    const url = this.path(Path.Login);
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
    return response as SignInResponse;
  }

  signOut(): Promise<SignOutResponse> {
    const url = this.path(Path.Logout);
    return this.httpService
      .postAbsolute(url, undefined, this.session!.authorizationValue)
      .catch((errorResponse) => {
        return errorResponse;
      }) as Promise<SignOutResponse>;
  }

  async changePassword(
    currentServerPassword: string,
    newServerPassword: string,
    newKeyParams: SNRootKeyParams
  ): Promise<ChangePasswordResponse> {
    if (this.changing) {
      return this.createErrorResponse(
        messages.API_MESSAGE_CHANGE_PW_IN_PROGRESS
      );
    }
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    this.changing = true;
    const url = this.path(Path.ChangePassword);
    const params = this.params({
      current_password: currentServerPassword,
      new_password: newServerPassword,
      ...newKeyParams.getPortableValue(),
    });
    const response = await this.httpService
      .postAbsolute(url, params, this.session!.authorizationValue)
      .catch(async (errorResponse) => {
        if (isErrorResponseExpiredToken(errorResponse)) {
          return this.refreshSessionThenRetryRequest({
            verb: HttpVerb.Post,
            url,
            params,
          });
        }
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_CHANGE_PW_FAIL
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
  ): Promise<HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = await this.path(Path.Sync);
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

  private async refreshSessionThenRetryRequest(httpRequest: HttpRequest) {
    const sessionResponse = await this.refreshSession();
    if (sessionResponse?.error) {
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

  async refreshSession() {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError as SessionRenewalResponse;
    }
    this.refreshingSession = true;
    const url = this.path(Path.SessionRefresh);
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
    return result as SessionRenewalResponse;
  }

  async getSessionsList(): Promise<HttpResponse<RemoteSession[]>> {
    const preprocessingError = this.preprocessingError<RemoteSession[]>();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = this.path(Path.Sessions);
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

  async deleteSession(
    sessionId: UuidString
  ): Promise<RevisionListResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = this.path(Path.Session);
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

  async getItemRevisions(
    itemId: UuidString
  ): Promise<RevisionListResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = this.path(Path.ItemRevisions).replace(/:item_id/, itemId);
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
    const url = this.path(Path.ItemRevision)
      .replace(/:item_id/, itemId)
      .replace(/:id/, entry.uuid);
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

  private preprocessingError<T = unknown>() {
    if (this.refreshingSession) {
      return this.createErrorResponse<T>(
        messages.API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS
      );
    }
    if (!this.session) {
      return this.createErrorResponse<T>(messages.API_MESSAGE_INVALID_SESSION);
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

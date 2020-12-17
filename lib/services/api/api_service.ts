import { UuidString } from './../../types';
import {
  ChangePasswordResponse,
  HttpResponse,
  KeyParamsResponse,
  RegistrationResponse,
  RevisionListEntry,
  RevisionListResponse,
  SessionListResponse,
  SessionRenewalResponse,
  SignInResponse,
  SignOutResponse,
  SingleRevisionResponse,
  StatusCode,
  isErrorResponseExpiredToken,
} from './responses';
import { Session, TokenSession } from './session';
import { ContentType } from '@Models/content_types';
import { PurePayload } from '@Payloads/pure_payload';
import { SNRootKeyParams } from './../../protocol/key_params';
import { SNStorageService } from './../storage_service';
import { HttpRequest, HttpVerb, SNHttpService } from './http_service';
import merge from 'lodash/merge';
import { ApiEndpointParam } from '@Services/api/keys';
import * as messages from '@Services/api/messages';
import { PureService } from '@Services/pure_service';
import { joinPaths } from '@Lib/utils';
import { StorageKey } from '@Lib/storage_keys';

const REQUEST_PATH_KEY_PARAMS = '/auth/params';
const REQUEST_PATH_REGISTER = '/auth';
const REQUEST_PATH_LOGIN = '/auth/sign_in';
const REQUEST_PATH_CHANGE_PW = '/auth/change_pw';
const REQUEST_PATH_SYNC = '/items/sync';
const REQUEST_PATH_LOGOUT = '/auth/sign_out';
const REQUEST_PATH_SESSION_REFRESH = '/session/refresh';
const REQUEST_PATH_ALL_SESSIONS = '/sessions';
const REQUEST_PATH_SESSION = '/session';
const REQUEST_PATH_ITEM_REVISIONS = '/items/:item_id/revisions';
const REQUEST_PATH_ITEM_REVISION = '/items/:item_id/revisions/:id';

const API_VERSION = '20200115';

type InvalidSessionObserver = () => void;

export class SNApiService extends PureService {
  private host?: string
  private session?: Session

  private registering = false
  private authenticating = false
  private changing = false
  private refreshingSession = false

  private invalidSessionObserver?: InvalidSessionObserver;

  constructor(
    private httpService: SNHttpService,
    private storageService: SNStorageService,
    defaultHost?: string
  ) {
    super();
    this.host = defaultHost;
  }

  /** @override */
  deinit() {
    (this.httpService as any) = undefined;
    (this.storageService as any) = undefined;
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
   */
  public setInvalidSessionObserver(observer: InvalidSessionObserver) {
    this.invalidSessionObserver = observer;
  }

  public async loadHost() {
    const storedValue = await this.storageService!.getValue(StorageKey.ServerHost);
    this.host = storedValue || this.host || (window as any)._default_sync_server;
  }

  public async setHost(host: string) {
    this.host = host;
    await this.storageService.setValue(StorageKey.ServerHost, host);
  }

  public getHost() {
    return this.host;
  }

  public async setSession(session: Session, persist = true) {
    this.session = session;
    if (persist) {
      await this.storageService.setValue(StorageKey.Session, session);
    }
  }

  public getSession() {
    return this.session;
  }

  private async path(path: string) {
    const host = await this.getHost();
    if (!host) {
      throw `Attempting to build path ${path} with no host.`;
    }
    if (!path) {
      throw 'Attempting to build path with null path.';
    }
    return joinPaths(host, path);
  }

  private get apiVersion() {
    return API_VERSION;
  }

  private params(inParams: any) {
    const params = merge(inParams, {
      [ApiEndpointParam.ApiVersion]: this.apiVersion
    });
    return params;
  }

  public createErrorResponse(message: string, status?: StatusCode) {
    return { error: { message, status } } as HttpResponse;
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

  /**
   * @param mfaKeyPath  The params path the server expects for authentication against
   *                    a particular mfa challenge. A value of foo would mean the server
   *                    would receive parameters as params['foo'] with value equal to mfaCode.
   * @param mfaCode     The mfa challenge response value.
   */
  async getAccountKeyParams(email: string, mfaKeyPath?: string, mfaCode?: string) {
    const url = await this.path(REQUEST_PATH_KEY_PARAMS);
    const params = this.params({
      email: email
    });
    if (mfaKeyPath) {
      params[mfaKeyPath] = mfaCode;
    }
    const response = await this.httpService!.getAbsolute(
      url,
      params,
      /** A session is optional here, if valid, endpoint returns extra params */
      this.session?.authorizationValue
    ).catch((errorResponse: HttpResponse) => {
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_INVALID_LOGIN
      );
    });
    return response as KeyParamsResponse;
  }

  async register(email: string, serverPassword: string, keyParams: SNRootKeyParams) {
    if (this.registering) {
      return this.createErrorResponse(messages.API_MESSAGE_REGISTRATION_IN_PROGRESS) as RegistrationResponse;
    }
    this.registering = true;
    const url = await this.path(REQUEST_PATH_REGISTER);
    const params = this.params({
      password: serverPassword,
      email: email,
      ...keyParams.getPortableValue()
    });
    const response = await this.httpService!.postAbsolute(url, params)
      .catch((errorResponse) => {
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_REGISTRATION_FAIL
        );
      });
    this.registering = false;
    return response as RegistrationResponse;
  }

  async signIn(
    email: string,
    serverPassword: string,
    mfaKeyPath?: string,
    mfaCode?: string
  ) {
    if (this.authenticating) {
      return this.createErrorResponse(messages.API_MESSAGE_LOGIN_IN_PROGRESS) as SignInResponse;
    }
    this.authenticating = true;
    const url = await this.path(REQUEST_PATH_LOGIN);
    const params = this.params({
      email: email,
      password: serverPassword
    });
    if (mfaKeyPath) {
      params[mfaKeyPath] = mfaCode;
    }
    const response = await this.httpService!.postAbsolute(
      url,
      params
    ).catch((errorResponse) => {
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_INVALID_LOGIN
      );
    });

    this.authenticating = false;
    return response as SignInResponse;
  }

  async signOut() {
    const url = await this.path(REQUEST_PATH_LOGOUT);
    return this.httpService!.postAbsolute(
      url,
      undefined,
      this.session!.authorizationValue
    ).catch(errorResponse => {
      return errorResponse;
    }) as Promise<SignOutResponse>;
  }

  async changePassword(
    currentServerPassword: string,
    newServerPassword: string,
    newKeyParams: SNRootKeyParams
  ): Promise<ChangePasswordResponse> {
    if (this.changing) {
      return this.createErrorResponse(messages.API_MESSAGE_CHANGE_PW_IN_PROGRESS);
    }
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    this.changing = true;
    const url = await this.path(REQUEST_PATH_CHANGE_PW);
    const params = this.params({
      current_password: currentServerPassword,
      new_password: newServerPassword,
      ...newKeyParams.getPortableValue()
    });
    const response = await this.httpService!.postAbsolute(
      url,
      params,
      this.session!.authorizationValue
    ).catch(async (errorResponse) => {
      if (isErrorResponseExpiredToken(errorResponse)) {
        return this.refreshSessionThenRetryRequest({
          verb: HttpVerb.Post,
          url,
          params
        });
      }
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_CHANGE_PW_FAIL
      );
    });

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
  ) {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = await this.path(REQUEST_PATH_SYNC);
    const params = this.params({
      [ApiEndpointParam.SyncPayloads]: payloads.map((p) => p.ejected()),
      [ApiEndpointParam.LastSyncToken]: lastSyncToken,
      [ApiEndpointParam.PaginationToken]: paginationToken,
      [ApiEndpointParam.IntegrityCheck]: checkIntegrity,
      [ApiEndpointParam.SyncDlLimit]: limit,
      content_type: contentType,
      event: customEvent
    });
    const response = await this.httpService!.postAbsolute(
      url,
      params,
      this.session!.authorizationValue
    ).catch(async (errorResponse) => {
      this.preprocessAuthenticatedErrorResponse(errorResponse);
      if (isErrorResponseExpiredToken(errorResponse)) {
        return this.refreshSessionThenRetryRequest({
          verb: HttpVerb.Post,
          url,
          params
        });
      }
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    });

    return response;
  }

  private async refreshSessionThenRetryRequest(httpRequest: HttpRequest) {
    const sessionResponse = await this.refreshSession();
    if (sessionResponse?.error) {
      return sessionResponse;
    } else {
      return this.httpService!.runHttp({
        ...httpRequest,
        authentication: this.session!.authorizationValue
      }).catch((errorResponse) => {
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
    const url = await this.path(REQUEST_PATH_SESSION_REFRESH);
    const session = this.session! as TokenSession;
    const params = this.params({
      access_token: session.accessToken,
      refresh_token: session.refreshToken
    });
    const result = await this.httpService!.postAbsolute(
      url,
      params
    ).then(async (response) => {
      const session = TokenSession.FromApiResponse(response as SessionRenewalResponse);
      await this.setSession(session);
      return response;
    }).catch((errorResponse) => {
      this.preprocessAuthenticatedErrorResponse(errorResponse);
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_TOKEN_REFRESH_FAIL
      );
    });
    this.refreshingSession = false;
    return result as SessionRenewalResponse;
  }

  async getSessionsList() {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = await this.path(REQUEST_PATH_ALL_SESSIONS);
    const response = await this.httpService!.getAbsolute(
      url,
      {},
      this.session!.authorizationValue
    ).catch(async (errorResponse) => {
      this.preprocessAuthenticatedErrorResponse(errorResponse);
      if (isErrorResponseExpiredToken(errorResponse)) {
        return this.refreshSessionThenRetryRequest({
          verb: HttpVerb.Get,
          url
        });
      }
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    });

    return response as SessionListResponse;
  }

  async deleteSession(sessionId: UuidString): Promise<RevisionListResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const url = await this.path(REQUEST_PATH_SESSION);
    try {
      return this.httpService.deleteAbsolute(
        url,
        { uuid: sessionId },
        this.session!.authorizationValue
      );
    } catch (error) {
      const errorResponse = error as HttpResponse;
      this.preprocessAuthenticatedErrorResponse(errorResponse);
      if (isErrorResponseExpiredToken(errorResponse)) {
        return this.refreshSessionThenRetryRequest({
          verb: HttpVerb.Get,
          url
        });
      }
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    }
  }

  async getItemRevisions(
    itemId: UuidString
  ): Promise<RevisionListResponse | HttpResponse> {
    const preprocessingError = this.preprocessingError();
    if (preprocessingError) {
      return preprocessingError;
    }
    const path = REQUEST_PATH_ITEM_REVISIONS.replace(/:item_id/, itemId);
    const url = await this.path(path);
    const response = await this.httpService!.getAbsolute(
      url,
      undefined,
      this.session!.authorizationValue
    ).catch((errorResponse: HttpResponse) => {
      this.preprocessAuthenticatedErrorResponse(errorResponse);
      if (isErrorResponseExpiredToken(errorResponse)) {
        return this.refreshSessionThenRetryRequest({
          verb: HttpVerb.Get,
          url
        });
      }
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    });
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
    const path = REQUEST_PATH_ITEM_REVISION
      .replace(/:item_id/, itemId)
      .replace(/:id/, entry.uuid);
    const url = await this.path(path);
    const response = await this.httpService!.getAbsolute(
      url,
      undefined,
      this.session!.authorizationValue
    ).catch((errorResponse: HttpResponse) => {
      this.preprocessAuthenticatedErrorResponse(errorResponse);
      if (isErrorResponseExpiredToken(errorResponse)) {
        return this.refreshSessionThenRetryRequest({
          verb: HttpVerb.Get,
          url
        });
      }
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    });
    return response;
  }

  private preprocessingError() {
    if (this.refreshingSession) {
      return this.createErrorResponse(messages.API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS);
    }
    if (!this.session) {
      return this.createErrorResponse(messages.API_MESSAGE_INVALID_SESSION);
    }
    return undefined;
  }

  /** Handle errored responses to authenticated requests */
  private preprocessAuthenticatedErrorResponse(response: HttpResponse) {
    if (response.status === StatusCode.HttpStatusInvalidSession && this.session) {
      this.invalidSessionObserver?.();
    }
  }

}

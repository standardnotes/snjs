import { Session } from './session';
import { ContentType } from '@Models/content_types';
import { PurePayload } from '@Payloads/pure_payload';
import { SNRootKeyParams } from './../../protocol/key_params';
import { SNStorageService } from './../storage_service';
import { SNHttpService, HttpResponse, HttpVerb, HttpRequest } from './http_service';
import merge from 'lodash/merge';
import { ApiEndpointParam } from '@Services/api/keys';
import * as messages from '@Services/api/messages';
import { PureService } from '@Services/pure_service';
import { isObject, isString, joinPaths } from '@Lib/utils';
import { StorageKey } from '@Lib/storage_keys';

const REQUEST_PATH_KEY_PARAMS = '/auth/params';
const REQUEST_PATH_REGISTER = '/auth';
const REQUEST_PATH_LOGIN = '/auth/sign_in';
const REQUEST_PATH_CHANGE_PW = '/auth/change_pw';
const REQUEST_PATH_SYNC = '/items/sync';
const REQUEST_PATH_LOGOUT = '/auth/sign_out';
const REQUEST_PATH_SESSION_REFRESH = '/session/refresh';
const REQUEST_PATH_ITEM_REVISIONS = '/items/:item_id/revisions';
const REQUEST_PATH_ITEM_REVISION = '/items/:item_id/revisions/:id';

const API_VERSION = '20200115';

export class SNApiService extends PureService {
  private httpService?: SNHttpService
  private storageService?: SNStorageService
  private host?: string
  private session?: Session

  private registering = false
  private authenticating = false
  private changing = false
  private refreshingSession = false

  constructor(httpService: SNHttpService, storageService: SNStorageService) {
    super();
    this.httpService = httpService;
    this.storageService = storageService;
  }

  /** @override */
  deinit() {
    this.httpService = undefined;
    this.storageService = undefined;
    this.host = undefined;
    this.session = undefined;
    super.deinit();
  }

  public async loadHost() {
    const storedValue = await this.storageService!.getValue(StorageKey.ServerHost);
    this.host = storedValue || (window as any)._default_sync_server;
  }

  public async setHost(host: string) {
    this.host = host;
    await this.storageService!.setValue(StorageKey.ServerHost, host);
  }

  public async getHost() {
    return this.host;
  }

  public async setSession(session: Session, persist: boolean = true) {
    this.session = session;
    if (persist) {
      await this.storageService!.setValue(StorageKey.Session, session);
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

  private params(inParams: any) {
    const params = merge(inParams, {
      [ApiEndpointParam.ApiVersion]: API_VERSION
    });
    return params;
  }

  public createErrorResponse(message: string) {
    return { error: { message: message } } as HttpResponse;
  }

  private errorResponseWithFallbackMessage(
    response: HttpResponse,
    message: string
  ) {
    if (!response.error.message) {
      response.error.message = message;
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
    const response = await this.httpService!.getAbsolute(url, params)
      .catch((errorResponse: HttpResponse) => {
        return this.errorResponseWithFallbackMessage(
          errorResponse,
          messages.API_MESSAGE_GENERIC_INVALID_LOGIN
        );
      });
    return response;
  }

  async register(email: string, serverPassword: string, keyParams: SNRootKeyParams) {
    if (this.registering) {
      return this.createErrorResponse(messages.API_MESSAGE_REGISTRATION_IN_PROGRESS);
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
    return response;
  }

  async signIn(
    email: string,
    serverPassword: string,
    mfaKeyPath?: string,
    mfaCode?: string
  ) {
    if (this.authenticating) {
      return this.createErrorResponse(messages.API_MESSAGE_LOGIN_IN_PROGRESS);
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
    return response;
  }

  async signOut() {
    const url = await this.path(REQUEST_PATH_LOGOUT);
    return this.httpService!.postAbsolute(
      url,
      undefined,
      this.session!.accessToken
    );
  }

  async changePassword(
    currentServerPassword: string,
    newServerPassword: string,
    newKeyParams: SNRootKeyParams
  ) {
    if (this.changing) {
      return this.createErrorResponse(messages.API_MESSAGE_CHANGE_PW_IN_PROGRESS);
    }
    if (this.refreshingSession) {
      return this.createErrorResponse(messages.API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS);
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
      this.session!.accessToken
    ).catch(async (errorResponse) => {
      if (this.httpService!.isErrorResponseExpiredToken(errorResponse)) {
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
    if (this.refreshingSession) {
      return this.createErrorResponse(messages.API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS);
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
      this.session!.accessToken
    ).catch(async (errorResponse) => {
      if (this.httpService!.isErrorResponseExpiredToken(errorResponse)) {
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
    return this.refreshSession().then((sessionResponse) => {
      if (sessionResponse?.error) {
        return sessionResponse;
      } else {
        return this.httpService!.runHttp({
          ...httpRequest, 
          authentication: this.session!.accessToken
        });
      }
    });
  }

  async refreshSession() {
    if (this.refreshingSession) {
      return this.createErrorResponse(messages.API_MESSAGE_TOKEN_REFRESH_IN_PROGRESS);
    }
    this.refreshingSession = true;
    const url = await this.path(REQUEST_PATH_SESSION_REFRESH);
    const params = this.params({
      access_token: this.session!.accessToken,
      refresh_token: this.session!.refreshToken
    });
    const result = await this.httpService!.postAbsolute(
      url,
      params
    ).then(async (response) => {
      const session = Session.FromResponse(response);
      await this.setSession(session);
      return response;
    }).catch((errorResponse) => {
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_TOKEN_REFRESH_FAIL
      );
    });
    this.refreshingSession = false;
    return result;
  }

  async getItemRevisions(itemId: string) {
    if (!this.session) {
      return undefined;
    }
    const path = REQUEST_PATH_ITEM_REVISIONS.replace(/:item_id/, itemId);
    const url = await this.path(path);
    const response = await this.httpService!.getAbsolute(
      url,
      undefined,
      this.session!.accessToken
    ).catch((errorResponse: HttpResponse) => {
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    });
    return response;
  }

  async getRevisionForItem(itemId: string, revisionId: string) {
    if (!this.session) {
      return undefined;
    }
    const path = REQUEST_PATH_ITEM_REVISION.replace(/:item_id/, itemId).replace(/:id/, revisionId);
    const url = await this.path(path);
    const response = await this.httpService!.getAbsolute(
      url,
      undefined,
      this.session!.accessToken
    ).catch((errorResponse: HttpResponse) => {
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    });
    return response;
  }

}
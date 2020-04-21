import { Session } from './session';
import { ContentType } from '@Models/content_types';
import { PurePayload } from '@Payloads/pure_payload';
import { SNRootKeyParams } from './../../protocol/key_params';
import { SNStorageService } from './../storage_service';
import { SNHttpService, HttpResponse } from './http_service';
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

const API_VERSION = '20200115';

export class SNApiService extends PureService {
  private httpService?: SNHttpService
  private storageService?: SNStorageService
  private host?: string
  private session?: Session

  private registering = false
  private authenticating = false
  private changing = false

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

  public setSession(session: Session) {
    this.session = session;
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

  async changePassword(
    currentServerPassword: string,
    newServerPassword: string,
    newKeyParams: SNRootKeyParams
  ) {
    if (this.changing) {
      return this.createErrorResponse(messages.API_MESSAGE_CHANGE_PW_IN_PROGRESS);
    }
    this.changing = true;
    const url = await this.path(REQUEST_PATH_CHANGE_PW);
    const params = {
      current_password: currentServerPassword,
      new_password: newServerPassword,
      ...newKeyParams.getPortableValue()
    };
    const response = await this.httpService!.postAbsolute(
      url,
      params,
      this.session!.token
    ).catch((errorResponse) => {
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
      this.session!.token
    ).catch((errorResponse) => {
      return this.errorResponseWithFallbackMessage(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    });

    return response;
  }
}
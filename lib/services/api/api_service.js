import merge from 'lodash/merge';
import { ApiEndpointParams } from '@Services/api/keys';
import * as messages from '@Services/api/messages';
import { PureService } from '@Services/pure_service';
import { isObject, isString, joinPaths } from '@Lib/utils';
import { StorageKeys } from '@Lib/storage_keys';

const REQUEST_PATH_KEY_PARAMS = '/auth/params';
const REQUEST_PATH_REGISTER = '/auth';
const REQUEST_PATH_LOGIN = '/auth/sign_in';
const REQUEST_PATH_CHANGE_PW = '/auth/change_pw';
const REQUEST_PATH_SYNC = '/items/sync';

const API_VERSION = '20200115';

export class SNApiService extends PureService {
  constructor({ httpService, storageService }) {
    super();
    this.httpService = httpService;
    this.storageService = storageService;
  }

  /** @override */
  deinit() {
    this.httpService = null;
    this.storageService = null;
    this.host = null;
    this.session = null;
    super.deinit();
  }

  async loadHost() {
    const storedValue = await this.storageService.getValue(StorageKeys.ServerHost);
    this.host = storedValue || window._default_sync_server;
  }

  async setHost(host) {
    this.host = host;
    await this.storageService.setValue(StorageKeys.ServerHost, host);
  }

  async getHost() {
    return this.host;
  }

  /** @access public */
  setSession(session) {
    this.session = session;
  }

  async path(path) {
    const host = await this.getHost();
    if (!host) {
      throw `Attempting to build path ${path} with no host.`;
    }
    if (!path) {
      throw 'Attempting to build path with null path.';
    }
    return joinPaths(host, path);
  }

  params(inParams) {
    const params = merge(inParams, {
      [ApiEndpointParams.ApiVersion]: API_VERSION
    });
    return params;
  }

  /** 
   * @access public 
   */
  errorResponseFromString(message) {
    return { error: { message: message } };
  }

  /**
   * @access private
   */
  errorResponseFromResponse(response, message) {
    this.log(`${message}: ${response}`);
    if (isObject(response)) {
      return response;
    } else if (isString(response)) {
      return this.errorResponseFromString(response);
    } else {
      return this.errorResponseFromString(message);
    }
  }

  /**
   * @param mfaKeyPath  The params path the server expects for authentication against
   *                    a particular mfa challenge. A value of foo would mean the server
   *                    would receive parameters as params['foo'] with value equal to mfaCode.
   * @param mfaCode     The mfa challenge response value.
   */
  async getAccountKeyParams({ email, mfaKeyPath, mfaCode }) {
    const url = await this.path(REQUEST_PATH_KEY_PARAMS);
    const params = this.params({
      email: email
    });
    if (mfaKeyPath) {
      params[mfaKeyPath] = mfaCode;
    }
    const response = await this.httpService.getAbsolute({
      url: url,
      params: params
    }).catch((errorResponse) => {
      return this.errorResponseFromResponse(
        errorResponse,
        messages.API_MESSAGE_GENERIC_INVALID_LOGIN
      );
    });
    return response;
  }

  async register({ email, serverPassword, keyParams }) {
    if (this.registering) {
      return this.errorResponseFromString(messages.API_MESSAGE_REGISTRATION_IN_PROGRESS);
    }

    this.registering = true;

    const url = await this.path(REQUEST_PATH_REGISTER);
    const params = this.params({
      password: serverPassword,
      email: email,
      ...keyParams.getPortableValue()
    });
    const response = await this.httpService.postAbsolute({
      url: url,
      params: params
    }).catch((errorResponse) => {
      return this.errorResponseFromResponse(
        errorResponse,
        messages.API_MESSAGE_GENERIC_REGISTRATION_FAIL
      );
    });

    this.registering = false;
    return response;
  }

  async signIn({ email, serverPassword, mfaKeyPath, mfaCode }) {
    if (this.authenticating) {
      return this.errorResponseFromString(messages.API_MESSAGE_LOGIN_IN_PROGRESS);
    }

    this.authenticating = true;

    const url = await this.path(REQUEST_PATH_LOGIN);
    const params = this.params({
      email: email,
      password: serverPassword,
      [mfaKeyPath]: mfaCode
    });
    const response = await this.httpService.postAbsolute({
      url: url,
      params: params
    }).catch((errorResponse) => {
      return this.errorResponseFromResponse(
        errorResponse,
        messages.API_MESSAGE_GENERIC_INVALID_LOGIN
      );
    });

    this.authenticating = false;
    return response;
  }

  async changePassword({ currentServerPassword, newServerPassword, newKeyParams }) {
    if (this.changing) {
      return this.errorResponseFromString(messages.API_MESSAGE_CHANGE_PW_IN_PROGRESS);
    }

    this.changing = true;

    const url = await this.path(REQUEST_PATH_CHANGE_PW);
    const params = {
      current_password: currentServerPassword,
      new_password: newServerPassword,
      ...newKeyParams.getPortableValue()
    };
    const response = await this.httpService.postAbsolute({
      url: url,
      params: params,
      authentication: this.session.token
    }).catch((errorResponse) => {
      return this.errorResponseFromResponse(
        errorResponse,
        messages.API_MESSAGE_GENERIC_CHANGE_PW_FAIL
      );
    });

    this.changing = false;
    return response;
  }

  async sync({
    payloads,
    lastSyncToken,
    paginationToken,
    limit,
    checkIntegrity,
    contentType,
    customEvent
  }) {
    const url = await this.path(REQUEST_PATH_SYNC);
    const params = this.params({
      [ApiEndpointParams.SyncPayloads]: payloads,
      [ApiEndpointParams.LastSyncToken]: lastSyncToken,
      [ApiEndpointParams.PaginationToken]: paginationToken,
      [ApiEndpointParams.IntegrityCheck]: checkIntegrity,
      [ApiEndpointParams.SyncDlLimit]: limit,
      content_type: contentType,
      event: customEvent
    });
    const response = await this.httpService.postAbsolute({
      url: url,
      params: params,
      authentication: this.session.token
    }).catch((errorResponse) => {
      return this.errorResponseFromResponse(
        errorResponse,
        messages.API_MESSAGE_GENERIC_SYNC_FAIL
      );
    });

    return response;
  }
}
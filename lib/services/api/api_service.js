const REQUEST_PATH_KEY_PARAMS     = '/auth/params';
const REQUEST_PATH_REGISTER       = '/auth';
const REQUEST_PATH_LOGIN          = '/auth/sign_in';
const REQUEST_PATH_CHANGE_PW      = '/auth/change_pw';
const REQUEST_PATH_SYNC           = '/items/sync';
const MINIMUM_PASSWORD_LENGTH     = 8;

import * as keys from '@Services/api/keys';

export class SNApiService {

  constructor({httpManager, storageManager}) {
    this.httpManager = httpManager;
    this.storageManager = storageManager;
  }

  async setHost(host) {
    this.host = host;
    await this.storageManager.setValue(STORAGE_KEY_SERVER_HOST, host)
  }

  async getHost() {
    if(!this.host) {
      const storedValue = await this.storageManager.getValue(STORAGE_KEY_SERVER_HOST);
      this.host = storedValue || window._default_sf_server;
    }
    return this.host;
  }

  async path(path) {
    return (await this.getHost()) + path;
  }

  async params(inParams)  {
    const params = merge(inParams, {
      api: SNHttpManager.getApiVersion()
    })
  }

  error(message) {
    return {error: {message: message}};
  }

  errorResponse(response, message) {
    this.log('${message}: ${response}');
    if(isObject(response)) {
      return response;
    } else if(isString(response)) {
      return this.error(response);
    } else {
      return this.error(message);
    }
  }

  /**
   * @param mfaKeyPath  The params path the server expects for authentication against
   *                    a particular mfa challenge. A value of foo would mean the server
   *                    would receive parameters as params['foo'] with value equal to mfaCode.
   * @param mfaCode     The mfa challenge response value.
   */
  async getAccountKeyParams({email, mfaKeyPath, mfaCode}) {
    const params =  this.params({
      email: email,
      [mfaKeyPath]: mfaCode
    });

    const url      = this.path(REQUEST_PATH_KEY_PARAMS);
    const response = await this.httpManager.getAbsolute(url, params)
                    .catch(async (errorResponse) => {
                      return this.errorResponse(errorResponse,
                        messages.API_MESSAGE_GENERIC_INVALID_LOGIN
                      );
                    });

    return response;
  }

  async register({email, serverPassword, keyParams}) {
    if(this.registerInProgress) {
      return this.error(messages.API_MESSAGE_REGISTRATION_IN_PROGRESS);
    }

    this.registering = true;

    const url = this.path(REQUEST_PATH_REGISTER);
    const params = this.params({
      password: serverPassword,
      email: email,
      ...keyParams
    });
    const response = await this.httpManager.postAbsolute(url, params)
                    .catch((errorResponse) => {
                      return this.errorResponse(errorResponse,
                        messages.API_MESSAGE_GENERIC_REGISTRATION_FAIL
                      );
                    });

    this.registering = false;
    return response;
  }

  async signIn({email, serverPassword, mfaKeyPath, mfaCode}) {
    if(this.authenticating) {
      return this.error(messages.API_MESSAGE_LOG_IN_PROGRESS);
    }

    this.authenticating = true;

    const url = this.path(REQUEST_PATH_LOGIN);
    const params = this.params({
      email: email,
      password: serverPassword,
      [mfaKeyPath]: mfaCode
    });
    const response = await this.httpManager.postAbsolute(url, params)
                    .catch((errorResponse) => {
                      return this.errorResponse(errorResponse,
                        messages.API_MESSAGE_GENERIC_INVALID_LOGIN
                      );
                    });

    this.authenticating = false;
    return response;
  }

  async changePassword({email, currentServerPassword, newServerPassword, newKeyParams}) {
    if(this.changing) {
      return this.error(messages.API_MESSAGE_CHANGE_PW_IN_PROGRESS);
    }

    this.changing = true;

    const url = this.path(REQUEST_PATH_CHANGE_PW);
    const params = {
      current_password: currentServerPassword,
      new_password: newServerPassword,
      ...newKeyParams
    };
    const response = await this.httpManager.postAbsolute(url, params)
                    .catch((errorResponse) => {
                      return this.errorResponse(errorResponse,
                        messages.API_MESSAGE_GENERIC_CHANGE_PW_FAIL
                      );
                    });

    this.changing = false;
    return response;
  }

  /**
   * @Syncing
   */

  async sync({
    payloads,
    lastSyncToken,
    paginationToken,
    limit,
    checkIntegrity
  }) {
    const url = this.path(REQUEST_PATH_SYNC)
    const params = this.params({
      [keys.API_KEY_SYNC_PAYLOADS]    : payloads,
      [keys.API_KEY_LAST_SYNC_TOKEN]  : lastSyncToken,
      [keys.API_KEY_PAGINATION_TOKEN] : paginationToken,
      [keys.API_KEY_INTEGRITY_CHECK]  : checkIntegrity,
      [keys.API_KEY_SYNC_DL_LIMIT]    : limit,
    });
    const response = await this.httpManager.postAbsolute(url, params)
                    .catch((errorResponse) => {
                      return this.errorResponse(
                        errorResponse,
                        messages.API_MESSAGE_GENERIC_SYNC_FAIL
                      );
                    });

    return response;
  }

}

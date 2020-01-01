import pull from 'lodash/pull';
import merge from 'lodash/merge';
import { SNAlertManager } from '@Services/alertManager';
import { SNHttpManager } from '@Services/httpManager';
import {
  USER_STORAGE_KEY,
  JWT_STORAGE_KEY,
  SERVER_STORAGE_KEY,
  LEGACY_UUID_STORAGE_KEY
} from '@Protocol/storageKeys'
import {
  MIN_PASSWORD_LENGTH
} from '@Lib/constants';

export class SNAuthManager {
  constructor({
    storageManager,
    httpManager,
    alertManager,
    protocolManager,
    timeout
  }) {
    if(!storageManager || !httpManager || !protocolManager) {
      throw 'Invalid AuthManager construction';
    }

    this.protocolManager = protocolManager;
    this.httpManager = httpManager;
    this.storageManager = storageManager;
    this.alertManager = alertManager || new SNAlertManager();
    this.$timeout = timeout || setTimeout.bind(window);
    this.initializeFromDisk();
  }

  async initializeFromDisk() {
    const userData = await this.storageManager.getValue(USER_STORAGE_KEY);
    if(userData) {
      this.user = JSON.parse(userData);
    } else {
      // legacy, check for uuid
      const uuid = await this.storageManager.getValue(LEGACY_UUID_STORAGE_KEY);
      if(uuid) { this.user = {uuid: uuid} }
    }
  }

  isLoggedIn() {
    return this.user !== null;
  }

  offline() {
    return !this.user;
  }

  async getServerUrl() {
    const storedValue = await this.storageManager.getValue(SERVER_STORAGE_KEY);
    return storedValue || window._default_sf_server;
  }

  async signOut() {
    this.user = null;
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  isLocked() {
    return this.locked === true;
  }

  async returnAfterTimeout(value) {
    return new Promise((resolve, reject) => {
      this.$timeout(() => resolve(value));
    })
  }

  async getKeyParamsForEmail(url, email, extraParams) {
    let params =  merge({
      email: email,
      api: SNHttpManager.getApiVersion()
    }, extraParams);

    const requestUrl = url + '/auth/params';
    return this.httpManager.getAbsolute(requestUrl, params).then(async(response) => {
      const versionedKeyParams = this.protocolManager.createVersionedKeyParams(response);
      return {keyParams: versionedKeyParams};
    }).catch(async (response) => {
      console.error('Error getting auth params:', response);
      if(typeof response !== 'object') {
        response = {error: {message: "A server error occurred while trying to sign in. Please try again."}};
      }
      return response;
    })
  }

  async register({url, email, password, ephemeral}) {
    if(this.isLocked()) {
      return {error : {message: "Register already in progress."}};
    }

    if(password.length < MIN_PASSWORD_LENGTH) {
      const message = `Your password must be at least ${MIN_PASSWORD_LENGTH} characters in length. For your security, please choose a longer password or, ideally, a passphrase, and try again.`;
      return {error: {message: message}};
    }

    this.lock();

    const result = await this.protocolManager.createRootKey({identifier: email, password});
    const rootKey = result.key;
    const keyParams = result.keyParams;

    const requestUrl = url + '/auth';
    const params = merge({
      password: rootKey.serverPassword,
      email: email,
      api: SNHttpManager.getApiVersion()
    }, keyParams);

    return this.httpManager.postAbsolute(requestUrl, params).then(async (response) => {
      await this.handleAuthResponse({
        response,
        email,
        url
      });
      this.unlock();
      return this.returnAfterTimeout({
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      });
    }).catch((response) => {
      console.error("Registration Error:", response);
      if(typeof response !== 'object') {
        response = {error: {message: "A server error occurred while trying to register. Please try again."}};
      }
      this.unlock();
      return this.returnAfterTimeout(response);
    })
  }

  async signIn({url, email, password, strict, ephemeral, extraParams}) {
    if(this.isLoggedIn()) {
      return {error : {message: "Cannot log in because already signed in."}};
    }

    if(this.isLocked()) {
      return {error : {message: "Login already in progress."}};
    }

    this.lock();

    const keyParamsResponse = await this.getKeyParamsForEmail(url, email, extraParams);

    if(keyParamsResponse.error) {
      this.unlock();
      return keyParamsResponse;
    }

    const keyParams = keyParamsResponse.keyParams;

    if(!keyParams || !keyParams.kdfIterations) {
      this.unlock();
      return {error : {message: "Invalid email or password."}};
    }

    if(!this.protocolManager.supportedVersions().includes(keyParams.version)) {
      var message;
      if(this.protocolManager.isVersionNewerThanLibraryVersion(keyParams.version)) {
        // The user has a new account type, but is signing in to an older client.
        message = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
      } else {
        // The user has a very old account type, which is no longer supported by this client
        message = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
      }
      this.unlock();
      return {error: {message: message}};
    }

    if(this.protocolManager.isProtocolVersionOutdated(keyParams.version)) {
      let message = `The encryption version for your account, ${keyParams.version}, is outdated and requires upgrade. You may proceed with login, but are advised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.`
      let abort = false;
      await this.alertManager.confirm({
        title: "Update Needed",
        text: message,
        confirmButtonText: "Sign In",
      }).catch(() => {
        abort = true;
      })
      if(abort) {
        this.unlock();
        return {error: {}};
      }
    }

    if(!this.protocolManager.supportsPasswordDerivationCost(keyParams.kdfIterations)) {
      let message = "Your account was created on a platform with higher security capabilities than this browser supports. " +
      "If we attempted to generate your login keys here, it would take hours. " +
      "Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in."
      this.unlock();
      return {error: {message: message}};
    }

    const minimum = this.protocolManager.costMinimumForVersion(keyParams.version);
    if(keyParams.kdfIterations < minimum) {
      let message = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";
      this.unlock();
      return {error: {message: message}};
    }

    if(strict) {
      // Refuse sign in if keyParams.version is anything but the latest version
      const latestVersion = this.protocolManager.latestVersion();
      if(keyParams.version !== latestVersion) {
        let message = `Strict sign in refused server sign in parameters. The latest security version is ${latestVersion}, but your account is reported to have version ${keyParams.version}. If you'd like to proceed with sign in anyway, please disable strict sign in and try again.`;
        this.unlock();
        return {error: {message: message}};
      }
    }

    const rootKey = await this.protocolManager.computeRootKey({password, keyParams});

    const requestUrl = url + '/auth/sign_in';
    const params = merge({
      password: rootKey.serverPassword,
      email: email,
      api: SNHttpManager.getApiVersion()
    }, extraParams);

    return this.httpManager.postAbsolute(requestUrl, params).then(async (response) => {
      await this.handleAuthResponse({
        response,
        email,
        url
      });

      this.unlock();
      return this.returnAfterTimeout({
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      });
    }).catch((response) => {
      console.error("Error logging in", response);
      if(typeof response !== 'object') {
        response = {error: {message: "A server error occurred while trying to sign in. Please try again."}};
      }
      this.unlock();
      return this.returnAfterTimeout(response);
    });
  }

  async changePassword({url, email, currentPassword, currentKeyParams, newPassword}) {
    if(this.isLocked()) {
      return {error : {message: "Change password already in progress."}};
    }

    this.lock();

    const currentValues = await this.protocolManager.createRootKey({
      identifier: email,
      password: currentPassword
    });
    const currentRootKey = currentValues.key;

    const newValues = await this.protocolManager.createRootKey({
      identifier: email,
      password: newPassword
    });
    const newRootKey = newValues.key;
    const newRootKeyParams = newValues.keyParams;

    const requestUrl = url + '/auth/change_pw';
    const params = merge({
      current_password: currentRootKey.serverPassword,
      new_password: newRootKey.serverPassword,
      api: SNHttpManager.getApiVersion()
    }, newRootKeyParams);

    return this.httpManager.postAuthenticatedAbsolute(requestUrl, params).then(async (response) => {
      await this.handleAuthResponse({
        response,
        email,
      });
      this.unlock();
      return this.returnAfterTimeout({
        response: response,
        keyParams: newRootKeyParams,
        rootKey: newRootKey
      });
    }).catch(async (response) => {
      if(typeof response !== 'object') {
        response = {error: {message: "Something went wrong while changing your password. Your password was not changed. Please try again."}}
      }
      this.unlock();
      return this.returnAfterTimeout(response);
    })
  }

  async handleAuthResponse({response, email, url}) {
    this.user = response.user;
    await this.storageManager.setValue(JWT_STORAGE_KEY, response.token);
    await this.storageManager.setValue(USER_STORAGE_KEY, JSON.stringify(response.user));
    if(url) { await this.storageManager.setValue(SERVER_STORAGE_KEY, url) }
  }
}

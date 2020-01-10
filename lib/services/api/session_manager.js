import { isNullOrUndefined } from '@Lib/utils';
import { SNAlertManager } from '@Services/alertManager';
import {
  STORAGE_KEY_USER,
  STORAGE_KEY_LEGACY_UUID,
  STORAGE_KEY_JWT
} from '@Protocol/storageKeys'

const MINIMUM_PASSWORD_LENGTH     = 8;

export class SNSessionManager {
  constructor({
    storageManager,
    apiService,
    alertManager,
    protocolManager,
    timeout
  }) {
    if(!storageManager || !protocolManager) {
      throw 'Invalid SessionManager construction';
    }

    this.protocolManager = protocolManager;
    this.storageManager = storageManager;
    this.apiService = apiService;
    this.alertManager = alertManager || new SNAlertManager();
    this.timeout = timeout || setTimeout.bind(window);
  }

  async initializeFromDisk() {
    const userData = await this.storageManager.getValue(STORAGE_KEY_USER);
    if(userData) {
      this.user = JSON.parse(userData);
    } else {
      /** @legacy Check for uuid. */
      const uuid = await this.storageManager.getValue(STORAGE_KEY_LEGACY_UUID);
      if(uuid) { this.user = {uuid: uuid} }
    }
  }

  online() {
    return !this.offline();
  }

  offline() {
    return isNullOrUndefined(this.user);
  }

  async returnAfterTimeout(value) {
    return new Promise((resolve, reject) => {
      this.timeout(() => {
        resolve(value);
      })
    })
  }

  async signOut() {
    this.user = null;
  }

  async register({email, password}) {
    if(password.length < MINIMUM_PASSWORD_LENGTH) {
      return this.apiService.error(
        messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)
      );
    }
    const result = await this.protocolManager.createRootKey({
      identifier: email,
      password: password
    });
    const serverPassword = result.key.serverPassword;
    const keyParams = result.keyParams;
    const rootKey = result.key;

    return this.apiService.register({
      email,
      serverPassword,
      keyParams
    }).then(async (response) => {
      await this.handleAuthResponse(response);
      return this.returnAfterTimeout({
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      });
    });
  }

  async signIn({email, password, strict, mfaKeyPath, mfaCode}) {
    const paramsResponse = await this.apiService.getAccountKeyParams({
      email,
      mfaKeyPath,
      mfaCode
    }).then((response) => {
      const keyParams = this.protocolManager.createVersionedKeyParams(response);
      return {keyParams: keyParams};
    });

    if(paramsResponse.error) {
      return paramsResponse;
    }

    const keyParams = paramsResponse.keyParams;
    if(!keyParams || !keyParams.kdfIterations) {
      return this.apiService.error(messages.API_MESSAGE_FAILBACK_LOGIN_FAIL);
    }

    if(!this.protocolManager.supportedVersions().includes(keyParams.version)) {
      if(this.protocolManager.isVersionNewerThanLibraryVersion(keyParams.version)) {
        return this.apiService.error(messages.UNSUPPORTED_PROTOCOL_VERSION);
      } else {
        return this.apiService.error(messages.EXPIRED_PROTOCOL_VERSION);
      }
    }

    if(this.protocolManager.isProtocolVersionOutdated(keyParams.version)) {
      const message = messages.OUTDATED_PROTOCOL_VERSION;
      const confirmed = await this.alertManager.confirm({
        title: messages.OUTDATED_PROTOCOL_ALERT_TITLE,
        text: message,
        confirmButtonText: messages.OUTDATED_PROTOCOL_ALERT_IGNORE,
      }).catch((error) => {
        return false;
      })

      if(!confirmed) {
        return this.apiService.error();
      }
    }

    if(!this.protocolManager.supportsPasswordDerivationCost(keyParams.kdfIterations)) {
      return this.apiService.error(messages.UNSUPPORTED_PASSWORD_COST);
    }

    const minimum = this.protocolManager.costMinimumForVersion(keyParams.version);
    if(keyParams.kdfIterations < minimum) {
      return this.apiService.error(messages.INVALID_PASSWORD_COST);
    }

    if(strict) {
      const latest = this.protocolManager.latestVersion();
      if(keyParams.version !== latest) {
        return this.apiService.error(
          messages.StrictSignInFailed(keyParams.version, latest)
        );
      }
    }

    const {rootKey, serverPassword} = await this.protocolManager.computeRootKey({
      password: password,
      keyParams: keyParams
    }).then((rootKey) => {
      return {
        rootKey: rootKey,
        serverPassword: rootKey.serverPassword
      }
    });

    return this.apiService.signIn({
      email,
      serverPassword,
      mfaKeyPath,
      mfaCode
    }).then(async (response) => {
      await this.handleAuthResponse(response);
      return this.returnAfterTimeout({
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      });
    });
  }

  async changePassword({email, currentPassword, currentKeyParams, newPassword}) {
    const currentSeverPassword = await this.protocolManager.createRootKey({
      identifier: email,
      password: currentPassword
    }).then((result) => {
      return result.key.serverPassword;
    });
    const {newServerPassword, newRootKey, newKeyParams} = await this.protocolManager.createRootKey({
      identifier: email,
      password: newPassword
    }).then((result) => {
      return {
        newRootKey: result.key,
        newServerPassword: result.key.serverPassword,
        newKeyParams: result.keyParams
      }
    });
    return this.apiService.changePassword({
      email,
      currentSeverPassword,
      newServerPassword,
      newKeyParams
    }).then(async (response) => {
      await this.handleAuthResponse(response);
      return this.returnAfterTimeout({
        response: response,
        keyParams: newKeyParams,
        rootKey: newRootKey
      });
    });
  }

  async handleAuthResponse(response) {
    const user = response.user;
    this.user = user;
    await this.storageManager.setValue(STORAGE_KEY_USER, JSON.stringify(user));
    await this.setSessionAuthentication({token: response.token});
  }

  async setSessionAuthentication({token}) {
    await this.storageManager.setValue(STORAGE_KEY_JWT, token);
    this.apiService.setSessionAuthentication({token});
  }
}

import { PureService } from '@Lib/services/pure_service';
import { isNullOrUndefined } from '@Lib/utils';
import { SNAlertManager } from '@Services/alert_manager';
import { StorageKeys } from '@Lib/storage_keys';
import * as messages from './messages';

const MINIMUM_PASSWORD_LENGTH = 8;

export class SNSessionManager extends PureService {
  constructor({
    storageManager,
    apiService,
    alertManager,
    protocolService,
    timeout
  }) {
    if (!storageManager || !protocolService) {
      throw 'Invalid SessionManager construction';
    }
    super();

    this.protocolService = protocolService;
    this.storageManager = storageManager;
    this.apiService = apiService;
    this.alertManager = alertManager || new SNAlertManager();
    this.timeout = timeout || setTimeout.bind(window);
  }

  async initializeFromDisk() {
    this.user = await this.storageManager.getValue(StorageKeys.User);
    if(!this.user) {
      /** @legacy Check for uuid. */
      const uuid = await this.storageManager.getValue(StorageKeys.LegacyUuid);
      if (uuid) {
        this.user = { uuid: uuid };
      }
    }

    const token = await this.storageManager.getValue(StorageKeys.Jwt);
    if (token) {
      this.apiService.setSessionAuthentication({ token });
    }
  }

  online() {
    return !this.offline();
  }

  offline() {
    return isNullOrUndefined(this.user);
  }

  getUser() {
    return this.user;
  }

  async returnAfterTimeout(value) {
    return new Promise((resolve, reject) => {
      this.timeout(() => {
        resolve(value);
      });
    });
  }

  async signOut() {
    this.user = null;
  }

  async register({ email, password }) {
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      return this.apiService.error(
        messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)
      );
    }
    const result = await this.protocolService.createRootKey({
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

  async signIn({ email, password, strict, mfaKeyPath, mfaCode }) {
    const paramsResponse = await this.apiService.getAccountKeyParams({
      email,
      mfaKeyPath,
      mfaCode
    }).then((response) => {
      const keyParams = this.protocolService.createKeyParams(response);
      return { keyParams: keyParams };
    });

    if (paramsResponse.error) {
      return paramsResponse;
    }

    const keyParams = paramsResponse.keyParams;
    if (!keyParams || !keyParams.kdfIterations) {
      return this.apiService.error(messages.API_MESSAGE_FAILBACK_LOGIN_FAIL);
    }

    if (!this.protocolService.supportedVersions().includes(keyParams.version)) {
      if (this.protocolService.isVersionNewerThanLibraryVersion(keyParams.version)) {
        return this.apiService.error(messages.UNSUPPORTED_PROTOCOL_VERSION);
      } else {
        return this.apiService.error(messages.EXPIRED_PROTOCOL_VERSION);
      }
    }

    if (this.protocolService.isProtocolVersionOutdated(keyParams.version)) {
      const message = messages.OUTDATED_PROTOCOL_VERSION;
      const confirmed = await this.alertManager.confirm({
        title: messages.OUTDATED_PROTOCOL_ALERT_TITLE,
        text: message,
        confirmButtonText: messages.OUTDATED_PROTOCOL_ALERT_IGNORE,
        // eslint-disable-next-line handle-callback-err
      }).catch((error) => { });

      if (!confirmed) {
        return this.apiService.error();
      }
    }

    if (!this.protocolService.supportsPasswordDerivationCost(keyParams.kdfIterations)) {
      return this.apiService.error(messages.UNSUPPORTED_PASSWORD_COST);
    }

    const minimum = this.protocolService.costMinimumForVersion(keyParams.version);
    if (keyParams.kdfIterations < minimum) {
      return this.apiService.error(messages.INVALID_PASSWORD_COST);
    }

    if (strict) {
      const latest = this.protocolService.getLatestVersion();
      if (keyParams.version !== latest) {
        return this.apiService.error(
          messages.StrictSignInFailed(keyParams.version, latest)
        );
      }
    }

    const { rootKey, serverPassword } = await this.protocolService.computeRootKey({
      password: password,
      keyParams: keyParams
    }).then((rootKey) => {
      return {
        rootKey: rootKey,
        serverPassword: rootKey.serverPassword
      };
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

  async changePassword({ email, currentPassword, currentKeyParams, newPassword }) {
    const currentServerPassword = await this.protocolService.computeRootKey({
      password: currentPassword,
      keyParams: currentKeyParams,
    }).then((key) => {
      return key.serverPassword;
    });
    const { newServerPassword, newRootKey, newKeyParams } = await this.protocolService.createRootKey({
      identifier: email,
      password: newPassword
    }).then((result) => {
      return {
        newRootKey: result.key,
        newServerPassword: result.key.serverPassword,
        newKeyParams: result.keyParams
      };
    });
    return this.apiService.changePassword({
      email,
      currentServerPassword,
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
    await this.storageManager.setValue(StorageKeys.User, user);
    await this.setSessionAuthentication({ token: response.token });
  }

  async setSessionAuthentication({ token }) {
    await this.storageManager.setValue(StorageKeys.Jwt, token);
    this.apiService.setSessionAuthentication({ token });
  }
}

import { PureService } from '@Lib/services/pure_service';
import { isNullOrUndefined } from '@Lib/utils';
import { SNAlertService } from '@Services/alert_service';
import { StorageKeys } from '@Lib/storage_keys';
import { Session } from '@Lib/services/api/session';
import * as messages from './messages';

const MINIMUM_PASSWORD_LENGTH = 8;

/**
 * The session manager is responsible for loading initial user state, and any relevant
 * server credentials, such as the session token. It also exposes methods for registering
 * for a new account, signing into an existing one, or changing an account password.
 */
export class SNSessionManager extends PureService {
  constructor({
    storageService,
    apiService,
    alertService,
    protocolService,
  }) {
    if (!storageService || !protocolService) {
      throw 'Invalid SessionManager construction';
    }
    super();

    this.protocolService = protocolService;
    this.storageService = storageService;
    this.apiService = apiService;
    this.alertService = alertService || new SNAlertService();
  }

  async initializeFromDisk() {
    this.user = await this.storageService.getValue(StorageKeys.User);
    if (!this.user) {
      /** @legacy Check for uuid. */
      const uuid = await this.storageService.getValue(StorageKeys.LegacyUuid);
      if (uuid) {
        this.user = { uuid: uuid };
      }
    }

    const rawSession = await this.storageService.getValue(StorageKeys.Session);
    if (rawSession) {
      await this.setSession(new Session(rawSession));
    }
  }

  /** @access private */
  async setSession(session) {
    this.session = session;
    this.apiService.setSession(this.session);
  }

  online() {
    return !this.offline();
  }

  offline() {
    return isNullOrUndefined(this.session);
  }

  getUser() {
    return this.user;
  }

  /** @access public */
  async signOut() {
    this.user = null;
    this.session = null;
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
      return {
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      };
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
    if (!keyParams || !keyParams.version) {
      return this.apiService.error(messages.API_MESSAGE_FALLBACK_LOGIN_FAIL);
    }
    if (!this.protocolService.supportedVersions().includes(keyParams.version)) {
      if (this.protocolService.isVersionNewerThanLibraryVersion(keyParams.version)) {
        return this.apiService.error(messages.UNSUPPORTED_PROTOCOL_VERSION);
      } else {
        return this.apiService.error(messages.EXPIRED_PROTOCOL_VERSION);
      }
    }
    if (this.protocolService.isProtocolVersionOutdated(keyParams.version)) {
      /* Cost minimums only apply to now outdated versions (001 and 002) */
      const minimum = this.protocolService.costMinimumForVersion(keyParams.version);
      if (keyParams.kdfIterations < minimum) {
        return this.apiService.error(messages.INVALID_PASSWORD_COST);
      };
      const message = messages.OUTDATED_PROTOCOL_VERSION;
      const confirmed = await this.alertService.confirm({
        title: messages.OUTDATED_PROTOCOL_ALERT_TITLE,
        text: message,
        confirmButtonText: messages.OUTDATED_PROTOCOL_ALERT_IGNORE,
      }).catch(() => {
        /* No-op */
      });
      if (!confirmed) {
        return this.apiService.error();
      }
    }
    if (!this.protocolService.platformSupportsKeyDerivation(keyParams)) {
      return this.apiService.error(messages.UNSUPPORTED_KEY_DERIVATION);
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
      return {
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      };
    });
  }

  async changePassword({ email, currentPassword, currentKeyParams, newPassword }) {
    if (newPassword.length < MINIMUM_PASSWORD_LENGTH) {
      return this.apiService.error(
        messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)
      );
    }
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
      return {
        response: response,
        keyParams: newKeyParams,
        rootKey: newRootKey
      };
    });
  }

  /** @access private */
  async handleAuthResponse(response) {
    const user = response.user;
    this.user = user;
    await this.storageService.setValue(StorageKeys.User, user);

    const session = new Session(response.token);
    await this.storageService.setValue(StorageKeys.Session, session);
    await this.setSession(session);
  }
}

import { PureService } from '@Lib/services/pure_service';
import { isNullOrUndefined } from '@Lib/utils';
import { SNAlertService } from '@Services/alert_service';
import { StorageKeys } from '@Lib/storage_keys';
import { Session } from '@Lib/services/api/session';
import * as messages from './messages';

const MINIMUM_PASSWORD_LENGTH = 8;

class SessionManagerResponse {
  constructor({ response, keyParams, rootKey }) {
    this.response = response;
    this.keyParams = keyParams;
    this.rootKey = rootKey;
    Object.freeze(this);
  }
}

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

  deinit() {
    this.protocolService = null;
    this.storageService = null;
    this.apiService = null;
    this.alertService = null;
    super.deinit();
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
      await this.setSession(Session.FromRaw(rawSession));
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

  /**
   * @access public
   * @returns {SessionManagerResponse}
   */
  async register({ email, password }) {
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      return new SessionManagerResponse({
        response: this.apiService.errorResponseFromString(
          messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)
        )
      });
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
      return new SessionManagerResponse({
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      });
    });
  }

  /**
   * @access public
   * @returns {SessionManagerResponse}
   */
  async signIn({ email, password, strict, mfaKeyPath, mfaCode }) {
    if(!email || !password) {
      throw Error('Email and password must be supplied during sign in');
    }
    const paramsResponse = await this.apiService.getAccountKeyParams({
      email,
      mfaKeyPath,
      mfaCode
    });
    if (paramsResponse.error) {
      return new SessionManagerResponse({
        response: paramsResponse
      });
    }
    const keyParams = this.protocolService.createKeyParams(paramsResponse);
    if (!keyParams || !keyParams.version) {
      return new SessionManagerResponse({
        response: this.apiService.errorResponseFromString(messages.API_MESSAGE_FALLBACK_LOGIN_FAIL)
      });
    }
    if (!this.protocolService.supportedVersions().includes(keyParams.version)) {
      if (this.protocolService.isVersionNewerThanLibraryVersion(keyParams.version)) {
        return new SessionManagerResponse({
          response: this.apiService.errorResponseFromString(messages.UNSUPPORTED_PROTOCOL_VERSION)
        });
      } else {
        return new SessionManagerResponse({
          response: this.apiService.errorResponseFromString(messages.EXPIRED_PROTOCOL_VERSION)
        });
      }
    }
    if (this.protocolService.isProtocolVersionOutdated(keyParams.version)) {
      /* Cost minimums only apply to now outdated versions (001 and 002) */
      const minimum = this.protocolService.costMinimumForVersion(keyParams.version);
      if (keyParams.kdfIterations < minimum) {
        return new SessionManagerResponse({
          response: this.apiService.errorResponseFromString(messages.INVALID_PASSWORD_COST)
        });
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
        return new SessionManagerResponse({
          response: this.apiService.errorResponseFromString()
        });
      }
    }
    if (!this.protocolService.platformSupportsKeyDerivation(keyParams)) {
      return new SessionManagerResponse({
        response: this.apiService.errorResponseFromString(messages.UNSUPPORTED_KEY_DERIVATION)
      });
    }
    if (strict) {
      const latest = this.protocolService.getLatestVersion();
      if (keyParams.version !== latest) {
        return new SessionManagerResponse({
          response: this.apiService.errorResponseFromString(
            messages.StrictSignInFailed(keyParams.version, latest)
          )
        });
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
      return new SessionManagerResponse({
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      });
    });
  }

  /**
   * @access public
   * @returns {SessionManagerResponse}
   */
  async changePassword({ currentPassword, currentKeyParams, newPassword }) {
    if (newPassword.length < MINIMUM_PASSWORD_LENGTH) {
      return new SessionManagerResponse({
        response: this.apiService.errorResponseFromString(
          messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)
        ),
      });
    }
    const currentServerPassword = await this.protocolService.computeRootKey({
      password: currentPassword,
      keyParams: currentKeyParams,
    }).then((key) => {
      return key.serverPassword;
    });
    const email = this.user.email;
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
      currentServerPassword,
      newServerPassword,
      newKeyParams
    }).then(async (response) => {
      await this.handleAuthResponse(response);
      return new SessionManagerResponse({
        response: response,
        keyParams: newKeyParams,
        rootKey: newRootKey
      });
    });
  }

  /** @access private */
  async handleAuthResponse(response) {
    if(response.error) {
      return;
    }
    const user = response.user;
    this.user = user;
    await this.storageService.setValue(StorageKeys.User, user);
    const session = new Session(response.token);
    await this.storageService.setValue(StorageKeys.Session, session);
    await this.setSession(session);
  }
}

import { SNProtocolService } from './../protocol_service';
import { SNApiService } from './api_service';
import { SNStorageService } from './../storage_service';
import { SNRootKey } from '@Protocol/root_key';
import { SNRootKeyParams, KeyParamsContent } from './../../protocol/key_params';
import { HttpResponse } from './http_service';
import { PureService } from '@Lib/services/pure_service';
import { isNullOrUndefined } from '@Lib/utils';
import { SNAlertService } from '@Services/alert_service';
import { StorageKey } from '@Lib/storage_keys';
import { Session } from '@Lib/services/api/session';
import * as messages from './messages';

export const MINIMUM_PASSWORD_LENGTH = 8;

type SessionManagerResponse = {
  response: HttpResponse;
  keyParams: SNRootKeyParams;
  rootKey: SNRootKey;
}

type User = {
  uuid: string
  email?: string
}

/**
 * The session manager is responsible for loading initial user state, and any relevant
 * server credentials, such as the session token. It also exposes methods for registering
 * for a new account, signing into an existing one, or changing an account password.
 */
export class SNSessionManager extends PureService {

  private storageService?: SNStorageService
  private apiService?: SNApiService
  private alertService?: SNAlertService
  private protocolService?: SNProtocolService

  private user?: User

  constructor(
    storageService: SNStorageService,
    apiService: SNApiService,
    alertService: SNAlertService,
    protocolService: SNProtocolService,
  ) {
    super();
    this.protocolService = protocolService;
    this.storageService = storageService;
    this.apiService = apiService;
    this.alertService = alertService;
  }

  deinit() {
    this.protocolService = undefined;
    this.storageService = undefined;
    this.apiService = undefined;
    this.alertService = undefined;
    this.user = undefined;
    super.deinit();
  }

  public async initializeFromDisk() {
    this.user = await this.storageService!.getValue(StorageKey.User);
    if (!this.user) {
      /** @legacy Check for uuid. */
      const uuid = await this.storageService!.getValue(StorageKey.LegacyUuid);
      if (uuid) {
        this.user = { uuid: uuid };
      }
    }

    const rawSession = await this.storageService!.getValue(StorageKey.Session);
    if (rawSession) {
      await this.setSession(Session.FromRaw(rawSession), false);
    }
  }

  private async setSession(session: Session, persist: boolean = true) {
    await this.apiService!.setSession(session, persist);
  }

  public online() {
    return !this.offline();
  }

  public offline() {
    return isNullOrUndefined(this.apiService!.getSession());
  }

  public getUser() {
    return this.user;
  }

  public async signOut() {
    this.user = undefined;
    const session = await this.apiService!.getSession();
    if (session && session.canExpire()) {
      this.apiService!.signOut();
    }
  }

  async register(email: string, password: string) {
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      return {
        response: this.apiService!.createErrorResponse(
          messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)
        )
      } as SessionManagerResponse;
    }
    const result = await this.protocolService!.createRootKey(
      email,
      password
    );
    const serverPassword = result.key.serverPassword;
    const keyParams = result.keyParams;
    const rootKey = result.key;

    return this.apiService!.register(
      email,
      serverPassword,
      keyParams
    ).then(async (response) => {
      await this.handleAuthResponse(response);
      return {
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      } as SessionManagerResponse;
    });
  }

  public async signIn(
    email: string,
    password: string,
    strict = false,
    mfaKeyPath?: string,
    mfaCode?: string
  ) {
    const paramsResponse = await this.apiService!.getAccountKeyParams(
      email,
      mfaKeyPath,
      mfaCode
    );
    if (paramsResponse.error) {
      return {
        response: paramsResponse
      } as SessionManagerResponse;
    }
    const rawKeyParams: KeyParamsContent = {
      pw_cost: paramsResponse.pw_cost,
      pw_nonce: paramsResponse.pw_nonce,
      identifier: paramsResponse.identifier,
      email: paramsResponse.email,
      pw_salt: paramsResponse.pw_salt,
      version: paramsResponse.version
    }
    const keyParams = this.protocolService!.createKeyParams(rawKeyParams);
    if (!keyParams || !keyParams.version) {
      return {
        response: this.apiService!.createErrorResponse(messages.API_MESSAGE_FALLBACK_LOGIN_FAIL)
      } as SessionManagerResponse;
    }
    if (!this.protocolService!.supportedVersions().includes(keyParams.version)) {
      if (this.protocolService!.isVersionNewerThanLibraryVersion(keyParams.version)) {
        return {
          response: this.apiService!.createErrorResponse(messages.UNSUPPORTED_PROTOCOL_VERSION)
        } as SessionManagerResponse;
      } else {
        return {
          response: this.apiService!.createErrorResponse(messages.EXPIRED_PROTOCOL_VERSION)
        } as SessionManagerResponse;
      }
    }
    if (this.protocolService!.isProtocolVersionOutdated(keyParams.version)) {
      /* Cost minimums only apply to now outdated versions (001 and 002) */
      const minimum = this.protocolService!.costMinimumForVersion(keyParams.version);
      if (keyParams.kdfIterations < minimum) {
        return {
          response: this.apiService!.createErrorResponse(messages.INVALID_PASSWORD_COST)
        } as SessionManagerResponse;
      };
      const message = messages.OUTDATED_PROTOCOL_VERSION;
      const confirmed = await this.alertService!.confirm(
        message,
        messages.OUTDATED_PROTOCOL_ALERT_TITLE,
        messages.OUTDATED_PROTOCOL_ALERT_IGNORE,
      );
      if (!confirmed) {
        return {
          response: this.apiService!.createErrorResponse(messages.API_MESSAGE_FALLBACK_LOGIN_FAIL)
        } as SessionManagerResponse;
      }
    }
    if (!this.protocolService!.platformSupportsKeyDerivation(keyParams)) {
      return {
        response: this.apiService!.createErrorResponse(messages.UNSUPPORTED_KEY_DERIVATION)
      } as SessionManagerResponse;
    }
    if (strict) {
      const latest = this.protocolService!.getLatestVersion();
      if (keyParams.version !== latest) {
        return {
          response: this.apiService!.createErrorResponse(
            messages.StrictSignInFailed(keyParams.version, latest)
          )
        } as SessionManagerResponse;
      }
    }
    const { rootKey, serverPassword } = await this.protocolService!.computeRootKey(
      password,
      keyParams
    ).then((rootKey) => {
      return {
        rootKey: rootKey,
        serverPassword: rootKey.serverPassword
      };
    });
    return this.apiService!.signIn(
      email,
      serverPassword,
      mfaKeyPath,
      mfaCode
    ).then(async (response) => {
      await this.handleAuthResponse(response);
      return {
        response: response,
        keyParams: keyParams,
        rootKey: rootKey
      } as SessionManagerResponse;
    });
  }

  public async changePassword(
    currentServerPassword: string,
    newServerPassword: string,
    newKeyParams: SNRootKeyParams
  ) {
    const response = await this.apiService!.changePassword(
      currentServerPassword,
      newServerPassword,
      newKeyParams
    );
    await this.handleAuthResponse(response);
    return response;
  }

  private async handleAuthResponse(response: HttpResponse) {
    if (response.error) {
      return;
    }
    const user = response.user;
    this.user = user;
    await this.storageService!.setValue(StorageKey.User, user);
    /*
      The token from response can be undefined if the user is using session tokens (protocol version >= 004).
      We should call setSession only if the session is updated with a new token.
    */
    if (response.token) {
      const session = Session.FromResponse(response);
      await this.setSession(session);
    }
  }
}

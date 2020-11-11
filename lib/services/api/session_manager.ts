import { SNLog } from './../../log';
import { leftVersionGreaterThanOrEqualToRight } from '@Lib/protocol/versions';
import { ProtocolVersion } from '@Protocol/versions';
import { Challenge, ChallengePrompt } from '@Lib/challenges';
import {
  ChallengeValidation,
  ChallengeReason,
  ChallengeKeyboardType
} from './../../challenges';
import { ChallengeService } from './../challenge/challenge_service';
import { JwtSession, TokenSession } from './session';
import {
  RegistrationResponse,
  SignInResponse,
  ChangePasswordResponse,
  HttpResponse,
  KeyParamsResponse,
  StatusCode
} from './responses';
import { SNProtocolService } from './../protocol_service';
import { SNApiService } from './api_service';
import { SNStorageService } from './../storage_service';
import { SNRootKey } from '@Protocol/root_key';
import {
  SNRootKeyParams,
  AnyKeyParamsContent,
  KeyParamsOrigination,
  KeyParamsFromApiResponse
} from './../../protocol/key_params';
import { PureService } from '@Lib/services/pure_service';
import { isNullOrUndefined } from '@Lib/utils';
import { SNAlertService } from '@Services/alert_service';
import { StorageKey } from '@Lib/storage_keys';
import { Session } from '@Lib/services/api/session';
import * as messages from './messages';
import { SessionStrings, SignInStrings, RegisterStrings, ErrorAlertStrings } from './messages';

export const MINIMUM_PASSWORD_LENGTH = 8;
export const MissingAccountParams = 'missing-params';

type SessionManagerResponse = {
  response: HttpResponse;
  rootKey?: SNRootKey;
  keyParams?: AnyKeyParamsContent
}

type User = {
  uuid: string
  email?: string
}

const cleanedEmailString = (email: string) => {
  return email.trim().toLowerCase();
}

export const enum SessionEvent {
  SessionRestored = 'SessionRestored'
};

/**
 * The session manager is responsible for loading initial user state, and any relevant
 * server credentials, such as the session token. It also exposes methods for registering
 * for a new account, signing into an existing one, or changing an account password.
 */
export class SNSessionManager extends PureService<SessionEvent> {

  private user?: User
  private isSessionRenewChallengePresented = false;

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private alertService: SNAlertService,
    private protocolService: SNProtocolService,
    private challengeService: ChallengeService,
  ) {
    super();
    apiService.setInvalidSessionObserver(() => {
      this.reauthenticateInvalidSession();
    });
  }

  deinit() {
    (this.protocolService as any) = undefined;
    (this.storageService as any) = undefined;
    (this.apiService as any) = undefined;
    (this.alertService as any) = undefined;
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
      await this.setSession(Session.FromRawStorageValue(rawSession), false);
    }
  }

  private async setSession(session: Session, persist: boolean = true) {
    await this.apiService.setSession(session, persist);
  }

  public online() {
    return !this.offline();
  }

  public offline() {
    return isNullOrUndefined(this.apiService.getSession());
  }

  public getUser() {
    if (this.user && !this.apiService.getSession()) {
      this.alertService.alert(
        ErrorAlertStrings.MissingSessionBody,
        ErrorAlertStrings.MissingSessionTitle
      );
      SNLog.error(Error('User is defined but no session is present.'))
    }
    return this.user;
  }

  public async signOut() {
    this.user = undefined;
    const session = this.apiService.getSession();
    if (session && session.canExpire()) {
      await this.apiService.signOut();
    }
  }

  public async reauthenticateInvalidSession(
    cancelable = true,
    onResponse?: (response: HttpResponse) => void
  ) {
    if (this.isSessionRenewChallengePresented) {
      return;
    }
    const currentKeyParams = await this.protocolService.getAccountKeyParams();
    if (!currentKeyParams) {
      onResponse?.({
        status: 0,
        error: {
          message: '',
          status: 0,
          tag: MissingAccountParams
        },
      });
      return;
    }
    this.isSessionRenewChallengePresented = true;
    const challenge = new Challenge(
      [
        new ChallengePrompt(ChallengeValidation.None, undefined, SessionStrings.EmailInputPlaceholder, false),
        new ChallengePrompt(ChallengeValidation.None, undefined, SessionStrings.PasswordInputPlaceholder)
      ],
      ChallengeReason.Custom,
      cancelable,
      SessionStrings.EnterEmailAndPassword,
      SessionStrings.RecoverSession(this.getUser()?.email)
    );
    return new Promise((resolve) => {
      this.challengeService.addChallengeObserver(
        challenge,
        {
          onCancel: () => {
            this.isSessionRenewChallengePresented = false;
          },
          onComplete: () => {
            this.isSessionRenewChallengePresented = false;
          },
          onNonvalidatedSubmit: async (challengeResponse) => {
            const email = challengeResponse.values[0].value as string;
            const password = challengeResponse.values[1].value as string;
            const signInResult = await this.signIn(email, password, false, currentKeyParams!.version);
            if (signInResult.response.error) {
              this.challengeService.setValidationStatusForChallenge(
                challenge,
                challengeResponse!.values[1],
                false
              );
              onResponse?.(signInResult.response);
            } else {
              resolve();
              this.challengeService.completeChallenge(challenge);
              this.notifyEvent(SessionEvent.SessionRestored);
              this.alertService!.alert(SessionStrings.SessionRestored);
            }
          }
        })
      this.challengeService.promptForChallengeResponse(challenge);
    })
  }

  private async promptForMfaValue() {
    const challenge = new Challenge(
      [
        new ChallengePrompt(
          ChallengeValidation.None,
          undefined,
          SessionStrings.MfaInputPlaceholder,
          false,
          ChallengeKeyboardType.Numeric
        )
      ],
      ChallengeReason.Custom,
      true,
      SessionStrings.EnterMfa
    );
    const response = await this.challengeService
      .promptForChallengeResponse(challenge);
    if (response) {
      this.challengeService.completeChallenge(challenge);
      return response.values[0].value as string;
    }
  }

  async register(email: string, password: string): Promise<SessionManagerResponse> {
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      return {
        response: this.apiService.createErrorResponse(
          messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)
        )
      };
    }
    const { wrappingKey, canceled } = await this.challengeService.getWrappingKeyIfApplicable();
    if (canceled) {
      return {
        response: this.apiService.createErrorResponse(
          RegisterStrings.PasscodeRequired,
          StatusCode.LocalValidationError
        )
      };
    }
    email = cleanedEmailString(email);
    const rootKey = await this.protocolService!.createRootKey(
      email,
      password,
      KeyParamsOrigination.Registration
    );
    const serverPassword = rootKey.serverPassword!;
    const keyParams = rootKey.keyParams;
    const registerResponse = await this.apiService.register(
      email,
      serverPassword,
      keyParams
    );
    if (!registerResponse.error) {
      await this.handleSuccessAuthResponse(registerResponse, rootKey, wrappingKey);
    }
    return {
      response: registerResponse,
      rootKey: rootKey
    };
  }

  private async retrieveKeyParams(
    email: string,
    mfaKeyPath?: string,
    mfaCode?: string
  ): Promise<{
    keyParams?: SNRootKeyParams,
    response: KeyParamsResponse,
    mfaKeyPath?: string,
    mfaCode?: string
  }> {
    const response = await this.apiService.getAccountKeyParams(
      email,
      mfaKeyPath,
      mfaCode
    );
    if (response.error) {
      if (mfaCode) {
        await this.alertService.alert(SignInStrings.IncorrectMfa);
      }
      if (response.error.payload?.mfa_key) {
        /** Prompt for MFA code and try again */
        const inputtedCode = await this.promptForMfaValue();
        if (!inputtedCode) {
          /** User dismissed window without input */
          return {
            response: this.apiService.createErrorResponse(
              SignInStrings.SignInCanceledMissingMfa,
              StatusCode.CanceledMfa
            )
          };
        }
        return this.retrieveKeyParams(
          email,
          response.error.payload.mfa_key,
          inputtedCode
        );
      } else {
        return { response };
      }
    }
    /** Make sure to use client value for identifier/email */
    const keyParams = KeyParamsFromApiResponse(response, email);
    if (!keyParams || !keyParams.version) {
      return {
        response: this.apiService.createErrorResponse(messages.API_MESSAGE_FALLBACK_LOGIN_FAIL)
      };
    }
    return { keyParams, response, mfaKeyPath, mfaCode };
  }

  public async signIn(
    email: string,
    password: string,
    strict = false,
    minAllowedVersion?: ProtocolVersion
  ): Promise<SessionManagerResponse> {
    const result = await this.performSignIn(
      email,
      password,
      strict,
      minAllowedVersion
    );
    if (
      result.response.error &&
      result.response.error.status !== StatusCode.LocalValidationError &&
      result.response.error.status !== StatusCode.CanceledMfa
    ) {
      /**
       * Try signing in with trimmed + lowercase version of email
       */
      const cleanedEmail = cleanedEmailString(email);
      const secondResult = await this.performSignIn(
        cleanedEmail,
        password,
        strict,
        minAllowedVersion
      );
      return secondResult;
    } else {
      return result;
    }
  }

  private async performSignIn(
    email: string,
    password: string,
    strict = false,
    minAllowedVersion?: ProtocolVersion
  ): Promise<SessionManagerResponse> {
    const paramsResult = await this.retrieveKeyParams(email);
    if (paramsResult.response.error) {
      return {
        response: paramsResult.response
      };
    }
    const keyParams = paramsResult.keyParams!;
    if (!this.protocolService!.supportedVersions().includes(keyParams.version)) {
      if (this.protocolService!.isVersionNewerThanLibraryVersion(keyParams.version)) {
        return {
          response: this.apiService.createErrorResponse(messages.UNSUPPORTED_PROTOCOL_VERSION)
        };
      } else {
        return {
          response: this.apiService.createErrorResponse(messages.EXPIRED_PROTOCOL_VERSION)
        };
      }
    }
    if (this.protocolService!.isProtocolVersionOutdated(keyParams.version)) {
      /* Cost minimums only apply to now outdated versions (001 and 002) */
      const minimum = this.protocolService!.costMinimumForVersion(keyParams.version);
      if (keyParams.content002.pw_cost < minimum) {
        return {
          response: this.apiService.createErrorResponse(messages.INVALID_PASSWORD_COST)
        };
      };
      const message = messages.OUTDATED_PROTOCOL_VERSION;
      const confirmed = await this.alertService!.confirm(
        message,
        messages.OUTDATED_PROTOCOL_ALERT_TITLE,
        messages.OUTDATED_PROTOCOL_ALERT_IGNORE,
      );
      if (!confirmed) {
        return {
          response: this.apiService.createErrorResponse(messages.API_MESSAGE_FALLBACK_LOGIN_FAIL)
        };
      }
    }
    if (!this.protocolService!.platformSupportsKeyDerivation(keyParams)) {
      return {
        response: this.apiService.createErrorResponse(messages.UNSUPPORTED_KEY_DERIVATION)
      };
    }
    if (strict) {
      minAllowedVersion = this.protocolService!.getLatestVersion();
    }
    if (!isNullOrUndefined(minAllowedVersion)) {
      if (!leftVersionGreaterThanOrEqualToRight(keyParams.version, minAllowedVersion)) {
        return {
          response: this.apiService.createErrorResponse(
            messages.StrictSignInFailed(keyParams.version, minAllowedVersion)
          )
        };
      }
    }
    const rootKey = await this.protocolService!.computeRootKey(
      password,
      keyParams
    );
    const signInResponse = await this.bypassChecksAndSignInWithRootKey(
      email,
      rootKey,
      paramsResult.mfaKeyPath,
      paramsResult.mfaCode
    )
    return {
      response: signInResponse
    };
  }

  public async bypassChecksAndSignInWithRootKey(
    email: string,
    rootKey: SNRootKey,
    mfaKeyPath?: string,
    mfaCode?: string,
  ): Promise<SignInResponse> {
    const { wrappingKey, canceled } = await this.challengeService.getWrappingKeyIfApplicable();
    if (canceled) {
      return this.apiService.createErrorResponse(
        SignInStrings.PasscodeRequired,
        StatusCode.LocalValidationError
      );
    }
    const signInResponse = await this.apiService.signIn(
      email,
      rootKey.serverPassword!,
      mfaKeyPath,
      mfaCode
    )
    if (!signInResponse.error) {
      const expandedRootKey = await SNRootKey.ExpandedCopy(rootKey, signInResponse.key_params);
      await this.handleSuccessAuthResponse(signInResponse, expandedRootKey, wrappingKey);
      return signInResponse;
    } else {
      if (signInResponse.error.payload?.mfa_key) {
        if (mfaCode) {
          await this.alertService.alert(SignInStrings.IncorrectMfa);
        }
        /** Prompt for MFA code and try again */
        const inputtedCode = await this.promptForMfaValue();
        if (!inputtedCode) {
          /** User dismissed window without input */
          return this.apiService.createErrorResponse(
            SignInStrings.SignInCanceledMissingMfa,
            StatusCode.CanceledMfa
          );
        }
        return this.bypassChecksAndSignInWithRootKey(
          email,
          rootKey,
          signInResponse.error.payload.mfa_key,
          inputtedCode
        )
      } else {
        /** Some other error, return to caller */
        return signInResponse;
      }
    }
  }

  public async changePassword(
    currentServerPassword: string,
    newRootKey: SNRootKey,
    wrappingKey?: SNRootKey
  ): Promise<SessionManagerResponse> {
    const response = await this.apiService.changePassword(
      currentServerPassword,
      newRootKey.serverPassword!,
      newRootKey.keyParams
    );
    if (!response.error) {
      await this.handleSuccessAuthResponse(response, newRootKey, wrappingKey);
    }
    return {
      response: response,
      keyParams: response.key_params
    };
  }

  public getSessionsList() {
    return this.apiService.getSessionsList();
  }

  private async handleSuccessAuthResponse(
    response: RegistrationResponse | SignInResponse | ChangePasswordResponse,
    rootKey: SNRootKey,
    wrappingKey?: SNRootKey
  ) {
    await this.protocolService.setRootKey(
      rootKey,
      wrappingKey
    );
    const user = response.user;
    this.user = user;
    await this.storageService!.setValue(StorageKey.User, user);
    if (response.token) {
      /** Legacy JWT response */
      const session = new JwtSession(response.token);
      await this.setSession(session);
    } else if (response.session) {
      /** Note that change password requests do not resend the exiting session object, so we
       * only overwrite our current session if the value is explicitely present */
      const session = TokenSession.FromApiResponse(response);
      await this.setSession(session);
    }
  }
}

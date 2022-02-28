import {
  ProtocolVersion,
  AnyKeyParamsContent,
  KeyParamsOrigination,
} from '@standardnotes/common'
import { leftVersionGreaterThanOrEqualToRight } from '@standardnotes/applications'
import { Challenge, ChallengePrompt } from '@Lib/challenges'
import {
  ChallengeKeyboardType,
  ChallengeReason,
  ChallengeValidation,
} from './../../challenges'
import { ChallengeService } from './../challenge/challenge_service'
import { JwtSession, RemoteSession, TokenSession } from './session'
import {
  GetSubscriptionResponse,
  ChangeCredentialsResponse,
  HttpResponse,
  KeyParamsResponse,
  RegistrationResponse,
  SessionListResponse,
  SignInResponse,
  StatusCode,
  User,
} from '@standardnotes/responses'
import { SNProtocolService } from './../protocol_service'
import { SNApiService } from './api_service'
import { SNStorageService } from './../storage_service'
import { SNRootKey } from '@Protocol/root_key'
import {
  KeyParamsFromApiResponse,
  SNRootKeyParams,
} from './../../protocol/key_params'
import { isNullOrUndefined } from '@standardnotes/utils'
import { SNAlertService } from '@Services/alert_service'
import { StorageKey } from '@Lib/storage_keys'
import { Session } from '@Lib/services/api/session'
import * as messages from './messages'
import {
  PromptTitles,
  RegisterStrings,
  SessionStrings,
  SignInStrings,
} from './messages'
import { UuidString } from '@Lib/types'
import { SNWebSocketsService } from './websockets_service'
import { AbstractService } from '@standardnotes/services'

export const MINIMUM_PASSWORD_LENGTH = 8
export const MissingAccountParams = 'missing-params'

type SessionManagerResponse = {
  response: HttpResponse;
  rootKey?: SNRootKey;
  keyParams?: AnyKeyParamsContent;
};

const cleanedEmailString = (email: string) => {
  return email.trim().toLowerCase()
}

export const enum SessionEvent {
  Restored = 'SessionRestored',
  Revoked = 'SessionRevoked',
}

/**
 * The session manager is responsible for loading initial user state, and any relevant
 * server credentials, such as the session token. It also exposes methods for registering
 * for a new account, signing into an existing one, or changing an account password.
 */
export class SNSessionManager extends AbstractService<SessionEvent> {
  private user?: User
  private isSessionRenewChallengePresented = false

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private alertService: SNAlertService,
    private protocolService: SNProtocolService,
    private challengeService: ChallengeService,
    private webSocketsService: SNWebSocketsService
  ) {
    super()
    apiService.setInvalidSessionObserver((revoked) => {
      if (revoked) {
        void this.notifyEvent(SessionEvent.Revoked)
      } else {
        void this.reauthenticateInvalidSession()
      }
    })
  }

  deinit(): void {
    (this.protocolService as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    (this.apiService as unknown) = undefined;
    (this.alertService as unknown) = undefined;
    (this.challengeService as unknown) = undefined;
    (this.webSocketsService as unknown) = undefined
    this.user = undefined
    super.deinit()
  }

  private setUser(user?: User) {
    this.user = user
    this.apiService.setUser(user)
  }

  public async initializeFromDisk() {
    this.setUser(await this.storageService.getValue(StorageKey.User))
    if (!this.user) {
      /** @legacy Check for uuid. */
      const uuid = await this.storageService.getValue(StorageKey.LegacyUuid)
      if (uuid) {
        this.setUser({ uuid: uuid, email: uuid })
      }
    }

    const rawSession = await this.storageService.getValue(StorageKey.Session)
    if (rawSession) {
      const session = Session.FromRawStorageValue(rawSession)
      await this.setSession(session, false)
      this.webSocketsService.startWebSocketConnection(
        session.authorizationValue
      )
    }
  }

  private async setSession(session: Session, persist = true) {
    await this.apiService.setSession(session, persist)
  }

  public online() {
    return !this.offline()
  }

  public offline() {
    return isNullOrUndefined(this.apiService.getSession())
  }

  public getUser() {
    return this.user
  }

  public getSession() {
    return this.apiService.getSession()
  }

  public async signOut() {
    this.setUser(undefined)
    const session = this.apiService.getSession()
    if (session && session.canExpire()) {
      await this.apiService.signOut()
      this.webSocketsService.closeWebSocketConnection()
    }
  }

  public isSignedIn(): boolean {
    return this.getUser() != undefined
  }

  public isSignedIntoFirstPartyServer(): boolean {
    return this.isSignedIn() && !this.apiService.isThirdPartyHostUsed()
  }

  public async reauthenticateInvalidSession(
    cancelable = true,
    onResponse?: (response: HttpResponse) => void
  ): Promise<void> {
    if (this.isSessionRenewChallengePresented) {
      return
    }
    this.isSessionRenewChallengePresented = true
    const challenge = new Challenge(
      [
        new ChallengePrompt(
          ChallengeValidation.None,
          undefined,
          SessionStrings.EmailInputPlaceholder,
          false
        ),
        new ChallengePrompt(
          ChallengeValidation.None,
          undefined,
          SessionStrings.PasswordInputPlaceholder
        ),
      ],
      ChallengeReason.Custom,
      cancelable,
      SessionStrings.EnterEmailAndPassword,
      SessionStrings.RecoverSession(this.getUser()?.email)
    )
    return new Promise((resolve) => {
      this.challengeService.addChallengeObserver(challenge, {
        onCancel: () => {
          this.isSessionRenewChallengePresented = false
        },
        onComplete: () => {
          this.isSessionRenewChallengePresented = false
        },
        onNonvalidatedSubmit: async (challengeResponse) => {
          const email = challengeResponse.values[0].value as string
          const password = challengeResponse.values[1].value as string
          const currentKeyParams = await this.protocolService.getAccountKeyParams()
          const signInResult = await this.signIn(
            email,
            password,
            false,
            this.storageService.isEphemeralSession(),
            currentKeyParams?.version
          )
          if (signInResult.response.error) {
            this.challengeService.setValidationStatusForChallenge(
              challenge,
              challengeResponse!.values[1],
              false
            )
            onResponse?.(signInResult.response)
          } else {
            resolve()
            this.challengeService.completeChallenge(challenge)
            this.notifyEvent(SessionEvent.Restored)
            this.alertService.alert(SessionStrings.SessionRestored)
          }
        },
      })
      this.challengeService.promptForChallengeResponse(challenge)
    })
  }

  public getSubscription(): Promise<HttpResponse | GetSubscriptionResponse> {
    return this.apiService.getSubscription(this.user!.uuid)
  }

  private async promptForMfaValue() {
    const challenge = new Challenge(
      [
        new ChallengePrompt(
          ChallengeValidation.None,
          PromptTitles.Mfa,
          SessionStrings.MfaInputPlaceholder,
          false,
          ChallengeKeyboardType.Numeric
        ),
      ],
      ChallengeReason.Custom,
      true,
      SessionStrings.EnterMfa
    )
    const response = await this.challengeService.promptForChallengeResponse(
      challenge
    )
    if (response) {
      this.challengeService.completeChallenge(challenge)
      return response.values[0].value as string
    }
  }

  async register(
    email: string,
    password: string,
    ephemeral: boolean
  ): Promise<SessionManagerResponse> {
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      return {
        response: this.apiService.createErrorResponse(
          messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)
        ),
      }
    }
    const {
      wrappingKey,
      canceled,
    } = await this.challengeService.getWrappingKeyIfApplicable()
    if (canceled) {
      return {
        response: this.apiService.createErrorResponse(
          RegisterStrings.PasscodeRequired,
          StatusCode.LocalValidationError
        ),
      }
    }
    email = cleanedEmailString(email)
    const rootKey = await this.protocolService!.createRootKey(
      email,
      password,
      KeyParamsOrigination.Registration
    )
    const serverPassword = rootKey.serverPassword!
    const keyParams = rootKey.keyParams
    const registerResponse = await this.apiService.register(
      email,
      serverPassword,
      keyParams,
      ephemeral
    )
    if (!registerResponse.error && registerResponse.data) {
      await this.handleSuccessAuthResponse(
        registerResponse as RegistrationResponse,
        rootKey,
        wrappingKey
      )
    }
    return {
      response: registerResponse,
      rootKey: rootKey,
    }
  }

  private async retrieveKeyParams(
    email: string,
    mfaKeyPath?: string,
    mfaCode?: string
  ): Promise<{
    keyParams?: SNRootKeyParams;
    response: KeyParamsResponse | HttpResponse;
    mfaKeyPath?: string;
    mfaCode?: string;
  }> {
    const response = await this.apiService.getAccountKeyParams(
      email,
      mfaKeyPath,
      mfaCode
    )
    if (response.error || isNullOrUndefined(response.data)) {
      if (mfaCode) {
        await this.alertService.alert(SignInStrings.IncorrectMfa)
      }
      if (response.error?.payload?.mfa_key) {
        /** Prompt for MFA code and try again */
        const inputtedCode = await this.promptForMfaValue()
        if (!inputtedCode) {
          /** User dismissed window without input */
          return {
            response: this.apiService.createErrorResponse(
              SignInStrings.SignInCanceledMissingMfa,
              StatusCode.CanceledMfa
            ),
          }
        }
        return this.retrieveKeyParams(
          email,
          response.error.payload.mfa_key,
          inputtedCode
        )
      } else {
        return { response }
      }
    }
    /** Make sure to use client value for identifier/email */
    const keyParams = KeyParamsFromApiResponse(
      response as KeyParamsResponse,
      email
    )
    if (!keyParams || !keyParams.version) {
      return {
        response: this.apiService.createErrorResponse(
          messages.API_MESSAGE_FALLBACK_LOGIN_FAIL
        ),
      }
    }
    return { keyParams, response, mfaKeyPath, mfaCode }
  }

  public async signIn(
    email: string,
    password: string,
    strict = false,
    ephemeral = false,
    minAllowedVersion?: ProtocolVersion
  ): Promise<SessionManagerResponse> {
    const result = await this.performSignIn(
      email,
      password,
      strict,
      ephemeral,
      minAllowedVersion
    )
    if (
      result.response.error &&
      result.response.error.status !== StatusCode.LocalValidationError &&
      result.response.error.status !== StatusCode.CanceledMfa
    ) {
      const cleanedEmail = cleanedEmailString(email)
      if (cleanedEmail !== email) {
        /**
         * Try signing in with trimmed + lowercase version of email
         */
        return this.performSignIn(
          cleanedEmail,
          password,
          strict,
          ephemeral,
          minAllowedVersion
        )
      } else {
        return result
      }
    } else {
      return result
    }
  }

  private async performSignIn(
    email: string,
    password: string,
    strict = false,
    ephemeral = false,
    minAllowedVersion?: ProtocolVersion
  ): Promise<SessionManagerResponse> {
    const paramsResult = await this.retrieveKeyParams(email)
    if (paramsResult.response.error) {
      return {
        response: paramsResult.response,
      }
    }
    const keyParams = paramsResult.keyParams!
    if (
      !this.protocolService!.supportedVersions().includes(keyParams.version)
    ) {
      if (
        this.protocolService!.isVersionNewerThanLibraryVersion(
          keyParams.version
        )
      ) {
        return {
          response: this.apiService.createErrorResponse(
            messages.UNSUPPORTED_PROTOCOL_VERSION
          ),
        }
      } else {
        return {
          response: this.apiService.createErrorResponse(
            messages.EXPIRED_PROTOCOL_VERSION
          ),
        }
      }
    }
    if (this.protocolService!.isProtocolVersionOutdated(keyParams.version)) {
      /* Cost minimums only apply to now outdated versions (001 and 002) */
      const minimum = this.protocolService!.costMinimumForVersion(
        keyParams.version
      )
      if (keyParams.content002.pw_cost < minimum) {
        return {
          response: this.apiService.createErrorResponse(
            messages.INVALID_PASSWORD_COST
          ),
        }
      }
      const message = messages.OUTDATED_PROTOCOL_VERSION
      const confirmed = await this.alertService!.confirm(
        message,
        messages.OUTDATED_PROTOCOL_ALERT_TITLE,
        messages.OUTDATED_PROTOCOL_ALERT_IGNORE
      )
      if (!confirmed) {
        return {
          response: this.apiService.createErrorResponse(
            messages.API_MESSAGE_FALLBACK_LOGIN_FAIL
          ),
        }
      }
    }
    if (!this.protocolService!.platformSupportsKeyDerivation(keyParams)) {
      return {
        response: this.apiService.createErrorResponse(
          messages.UNSUPPORTED_KEY_DERIVATION
        ),
      }
    }
    if (strict) {
      minAllowedVersion = this.protocolService!.getLatestVersion()
    }
    if (!isNullOrUndefined(minAllowedVersion)) {
      if (
        !leftVersionGreaterThanOrEqualToRight(
          keyParams.version,
          minAllowedVersion
        )
      ) {
        return {
          response: this.apiService.createErrorResponse(
            messages.StrictSignInFailed(keyParams.version, minAllowedVersion)
          ),
        }
      }
    }
    const rootKey = await this.protocolService!.computeRootKey(
      password,
      keyParams
    )
    const signInResponse = await this.bypassChecksAndSignInWithRootKey(
      email,
      rootKey,
      paramsResult.mfaKeyPath,
      paramsResult.mfaCode,
      ephemeral
    )
    return {
      response: signInResponse,
    }
  }

  public async bypassChecksAndSignInWithRootKey(
    email: string,
    rootKey: SNRootKey,
    mfaKeyPath?: string,
    mfaCode?: string,
    ephemeral = false
  ): Promise<SignInResponse | HttpResponse> {
    const {
      wrappingKey,
      canceled,
    } = await this.challengeService.getWrappingKeyIfApplicable()
    if (canceled) {
      return this.apiService.createErrorResponse(
        SignInStrings.PasscodeRequired,
        StatusCode.LocalValidationError
      )
    }
    const signInResponse = await this.apiService.signIn(
      email,
      rootKey.serverPassword!,
      mfaKeyPath,
      mfaCode,
      ephemeral
    )
    if (!signInResponse.error && signInResponse.data) {
      const expandedRootKey = await SNRootKey.ExpandedCopy(
        rootKey,
        (signInResponse as SignInResponse).data.key_params
      )
      await this.handleSuccessAuthResponse(
        signInResponse as SignInResponse,
        expandedRootKey,
        wrappingKey
      )
      return signInResponse
    } else {
      if (signInResponse.error?.payload?.mfa_key) {
        if (mfaCode) {
          await this.alertService.alert(SignInStrings.IncorrectMfa)
        }
        /** Prompt for MFA code and try again */
        const inputtedCode = await this.promptForMfaValue()
        if (!inputtedCode) {
          /** User dismissed window without input */
          return this.apiService.createErrorResponse(
            SignInStrings.SignInCanceledMissingMfa,
            StatusCode.CanceledMfa
          )
        }
        return this.bypassChecksAndSignInWithRootKey(
          email,
          rootKey,
          signInResponse.error.payload.mfa_key,
          inputtedCode
        )
      } else {
        /** Some other error, return to caller */
        return signInResponse
      }
    }
  }

  public async changeCredentials(parameters: {
    currentServerPassword: string;
    newRootKey: SNRootKey;
    wrappingKey?: SNRootKey;
    newEmail?: string;
  }): Promise<SessionManagerResponse> {
    const userUuid = this.user!.uuid
    const response = await this.apiService.changeCredentials({
      userUuid,
      currentServerPassword: parameters.currentServerPassword,
      newServerPassword: parameters.newRootKey.serverPassword!,
      newKeyParams: parameters.newRootKey.keyParams,
      newEmail: parameters.newEmail,
    })

    return this.processChangeCredentialsResponse(
      response as ChangeCredentialsResponse,
      parameters.newRootKey,
      parameters.wrappingKey
    )
  }

  public async getSessionsList(): Promise<
    (HttpResponse & { data: RemoteSession[] }) | HttpResponse
    > {
    const response = await this.apiService.getSessionsList()
    if (response.error || isNullOrUndefined(response.data)) {
      return response
    }
    (response as HttpResponse & {
      data: RemoteSession[];
    }).data = (response as SessionListResponse).data
      .map<RemoteSession>((session) => ({
        ...session,
        updated_at: new Date(session.updated_at),
      }))
      .sort((s1: RemoteSession, s2: RemoteSession) =>
        s1.updated_at < s2.updated_at ? 1 : -1
      )
    return response
  }

  public async revokeSession(sessionId: UuidString): Promise<HttpResponse> {
    const response = await this.apiService.deleteSession(sessionId)
    return response
  }

  public async revokeAllOtherSessions(): Promise<void> {
    const response = await this.getSessionsList()
    if (response.error != undefined || response.data == undefined) {
      throw new Error(
        response.error?.message ?? messages.API_MESSAGE_GENERIC_SYNC_FAIL
      )
    }
    const sessions = response.data as RemoteSession[]
    const otherSessions = sessions.filter((session) => !session.current)
    await Promise.all(
      otherSessions.map((session) => this.revokeSession(session.uuid))
    )
  }

  private async processChangeCredentialsResponse(
    response: ChangeCredentialsResponse,
    newRootKey: SNRootKey,
    wrappingKey?: SNRootKey
  ): Promise<SessionManagerResponse> {
    if (!response.error && response.data) {
      await this.handleSuccessAuthResponse(
        response as ChangeCredentialsResponse,
        newRootKey,
        wrappingKey
      )
    }
    return {
      response: response,
      keyParams: (response as ChangeCredentialsResponse).data?.key_params,
    }
  }

  private async handleSuccessAuthResponse(
    response: RegistrationResponse | SignInResponse | ChangeCredentialsResponse,
    rootKey: SNRootKey,
    wrappingKey?: SNRootKey
  ) {
    await this.protocolService.setRootKey(rootKey, wrappingKey)
    const { data } = response
    const user = data.user
    this.setUser(user)
    await this.storageService.setValue(StorageKey.User, user)
    this.apiService.setHost(this.apiService.getHost())
    if (data.token) {
      /** Legacy JWT response */
      const session = new JwtSession(data.token)
      await this.setSession(session)
      this.webSocketsService.startWebSocketConnection(
        session.authorizationValue
      )
    } else if (data.session) {
      /** Note that change password requests do not resend the exiting session object, so we
       * only overwrite our current session if the value is explicitely present */
      const session = TokenSession.FromApiResponse(response)
      await this.setSession(session)
      this.webSocketsService.startWebSocketConnection(
        session.authorizationValue
      )
    }
  }
}

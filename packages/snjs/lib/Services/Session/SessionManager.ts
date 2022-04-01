import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { Base64String } from '@standardnotes/sncrypto-common'
import { ClientDisplayableError } from '@standardnotes/responses'
import { CopyPayloadWithContentOverride } from '@standardnotes/models'
import { EncryptionService, CreateNewRootKey } from '@standardnotes/encryption'
import { isNullOrUndefined } from '@standardnotes/utils'
import { JwtSession } from './Sessions/JwtSession'
import { KeyParamsFromApiResponse, SNRootKeyParams, SNRootKey } from '@standardnotes/encryption'
import { PromptTitles, RegisterStrings, SessionStrings, SignInStrings } from '../Api/Messages'
import { RemoteSession, RawStorageValue } from './Sessions/Types'
import { Session } from './Sessions/Session'
import { SessionFromRawStorageValue } from './Sessions/Generator'
import { SessionsClientInterface } from './SessionsClientInterface'
import { ShareToken } from './ShareToken'
import { SNAlertService } from '@Lib/Services/Alert/AlertService'
import { SNApiService } from '../Api/ApiService'
import { SNStorageService } from '../Storage/StorageService'
import { SNWebSocketsService } from '../Api/WebsocketsService'
import { StorageKey } from '@standardnotes/services'
import { Strings } from '@Lib/Strings'
import { Subscription } from '@standardnotes/auth'
import { TokenSession } from './Sessions/TokenSession'
import { UuidString } from '@Lib/Types/UuidString'
import * as Challenge from '../Challenge'
import * as Common from '@standardnotes/common'
import * as Messages from '../Api/Messages'
import * as Responses from '@standardnotes/responses'

export const MINIMUM_PASSWORD_LENGTH = 8
export const MissingAccountParams = 'missing-params'

type SessionManagerResponse = {
  response: Responses.HttpResponse
  rootKey?: SNRootKey
  keyParams?: Common.AnyKeyParamsContent
}

const cleanedEmailString = (email: string) => {
  return email.trim().toLowerCase()
}

export enum SessionEvent {
  Restored = 'SessionRestored',
  Revoked = 'SessionRevoked',
}

/**
 * The session manager is responsible for loading initial user state, and any relevant
 * server credentials, such as the session token. It also exposes methods for registering
 * for a new account, signing into an existing one, or changing an account password.
 */
export class SNSessionManager
  extends AbstractService<SessionEvent>
  implements SessionsClientInterface
{
  private user?: Responses.User
  private isSessionRenewChallengePresented = false

  constructor(
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private alertService: SNAlertService,
    private protocolService: EncryptionService,
    private challengeService: Challenge.ChallengeService,
    private webSocketsService: SNWebSocketsService,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
    apiService.setInvalidSessionObserver((revoked) => {
      if (revoked) {
        void this.notifyEvent(SessionEvent.Revoked)
      } else {
        void this.reauthenticateInvalidSession()
      }
    })
  }

  deinit(): void {
    ;(this.protocolService as unknown) = undefined
    ;(this.storageService as unknown) = undefined
    ;(this.apiService as unknown) = undefined
    ;(this.alertService as unknown) = undefined
    ;(this.challengeService as unknown) = undefined
    ;(this.webSocketsService as unknown) = undefined
    this.user = undefined
    super.deinit()
  }

  private setUser(user?: Responses.User) {
    this.user = user
    this.apiService.setUser(user)
  }

  public async initializeFromDisk() {
    this.setUser(await this.storageService.getValue(StorageKey.User))

    if (!this.user) {
      /** @legacy Check for uuid. */
      const uuid = await this.storageService.getValue<string>(StorageKey.LegacyUuid)
      if (uuid) {
        this.setUser({ uuid: uuid, email: uuid })
      }
    }

    const rawSession = await this.storageService.getValue<RawStorageValue>(StorageKey.Session)
    if (rawSession) {
      const session = SessionFromRawStorageValue(rawSession)
      await this.setSession(session, false)
      this.webSocketsService.startWebSocketConnection(session.authorizationValue)
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

  public getSureUser() {
    return this.user as Responses.User
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
    onResponse?: (response: Responses.HttpResponse) => void,
  ): Promise<void> {
    if (this.isSessionRenewChallengePresented) {
      return
    }
    this.isSessionRenewChallengePresented = true
    const challenge = new Challenge.Challenge(
      [
        new Challenge.ChallengePrompt(
          Challenge.ChallengeValidation.None,
          undefined,
          SessionStrings.EmailInputPlaceholder,
          false,
        ),
        new Challenge.ChallengePrompt(
          Challenge.ChallengeValidation.None,
          undefined,
          SessionStrings.PasswordInputPlaceholder,
        ),
      ],
      Challenge.ChallengeReason.Custom,
      cancelable,
      SessionStrings.EnterEmailAndPassword,
      SessionStrings.RecoverSession(this.getUser()?.email),
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
            currentKeyParams?.version,
          )
          if (signInResult.response.error) {
            this.challengeService.setValidationStatusForChallenge(
              challenge,
              challengeResponse!.values[1],
              false,
            )
            onResponse?.(signInResult.response)
          } else {
            resolve()
            this.challengeService.completeChallenge(challenge)
            void this.notifyEvent(SessionEvent.Restored)
            void this.alertService.alert(SessionStrings.SessionRestored)
          }
        },
      })
      void this.challengeService.promptForChallengeResponse(challenge)
    })
  }

  public async getSubscription(): Promise<ClientDisplayableError | Subscription> {
    const result = await this.apiService.getSubscription(this.getSureUser().uuid)

    if (result.error) {
      return ClientDisplayableError.FromError(result.error)
    }

    const subscription = (result as Responses.GetSubscriptionResponse).data!.subscription!

    return subscription
  }

  public async getAvailableSubscriptions(): Promise<
    Responses.AvailableSubscriptions | ClientDisplayableError
  > {
    const response = await this.apiService.getAvailableSubscriptions()

    if (response.error) {
      return ClientDisplayableError.FromError(response.error)
    }

    return (response as Responses.GetAvailableSubscriptionsResponse).data!
  }

  private async promptForMfaValue() {
    const challenge = new Challenge.Challenge(
      [
        new Challenge.ChallengePrompt(
          Challenge.ChallengeValidation.None,
          PromptTitles.Mfa,
          SessionStrings.MfaInputPlaceholder,
          false,
          Challenge.ChallengeKeyboardType.Numeric,
        ),
      ],
      Challenge.ChallengeReason.Custom,
      true,
      SessionStrings.EnterMfa,
    )
    const response = await this.challengeService.promptForChallengeResponse(challenge)
    if (response) {
      this.challengeService.completeChallenge(challenge)
      return response.values[0].value as string
    }
  }

  async register(
    email: string,
    password: string,
    ephemeral: boolean,
  ): Promise<SessionManagerResponse> {
    if (password.length < MINIMUM_PASSWORD_LENGTH) {
      return {
        response: this.apiService.createErrorResponse(
          Messages.InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH),
        ),
      }
    }
    const { wrappingKey, canceled } = await this.challengeService.getWrappingKeyIfApplicable()
    if (canceled) {
      return {
        response: this.apiService.createErrorResponse(
          RegisterStrings.PasscodeRequired,
          Responses.StatusCode.LocalValidationError,
        ),
      }
    }
    email = cleanedEmailString(email)
    const rootKey = await this.protocolService.createRootKey(
      email,
      password,
      Common.KeyParamsOrigination.Registration,
    )
    const serverPassword = rootKey.serverPassword!
    const keyParams = rootKey.keyParams
    const registerResponse = await this.apiService.register(
      email,
      serverPassword,
      keyParams,
      ephemeral,
    )
    if (!registerResponse.error && registerResponse.data) {
      await this.handleSuccessAuthResponse(
        registerResponse as Responses.RegistrationResponse,
        rootKey,
        wrappingKey,
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
    mfaCode?: string,
  ): Promise<{
    keyParams?: SNRootKeyParams
    response: Responses.KeyParamsResponse | Responses.HttpResponse
    mfaKeyPath?: string
    mfaCode?: string
  }> {
    const response = await this.apiService.getAccountKeyParams(email, mfaKeyPath, mfaCode)
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
              Responses.StatusCode.CanceledMfa,
            ),
          }
        }
        return this.retrieveKeyParams(email, response.error.payload.mfa_key, inputtedCode)
      } else {
        return { response }
      }
    }
    /** Make sure to use client value for identifier/email */
    const keyParams = KeyParamsFromApiResponse(response as Responses.KeyParamsResponse, email)
    if (!keyParams || !keyParams.version) {
      return {
        response: this.apiService.createErrorResponse(Messages.API_MESSAGE_FALLBACK_LOGIN_FAIL),
      }
    }
    return { keyParams, response, mfaKeyPath, mfaCode }
  }

  public async signIn(
    email: string,
    password: string,
    strict = false,
    ephemeral = false,
    minAllowedVersion?: Common.ProtocolVersion,
  ): Promise<SessionManagerResponse> {
    const result = await this.performSignIn(email, password, strict, ephemeral, minAllowedVersion)
    if (
      result.response.error &&
      result.response.error.status !== Responses.StatusCode.LocalValidationError &&
      result.response.error.status !== Responses.StatusCode.CanceledMfa
    ) {
      const cleanedEmail = cleanedEmailString(email)
      if (cleanedEmail !== email) {
        /**
         * Try signing in with trimmed + lowercase version of email
         */
        return this.performSignIn(cleanedEmail, password, strict, ephemeral, minAllowedVersion)
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
    minAllowedVersion?: Common.ProtocolVersion,
  ): Promise<SessionManagerResponse> {
    const paramsResult = await this.retrieveKeyParams(email)
    if (paramsResult.response.error) {
      return {
        response: paramsResult.response,
      }
    }
    const keyParams = paramsResult.keyParams!
    if (!this.protocolService.supportedVersions().includes(keyParams.version)) {
      if (this.protocolService.isVersionNewerThanLibraryVersion(keyParams.version)) {
        return {
          response: this.apiService.createErrorResponse(Messages.UNSUPPORTED_PROTOCOL_VERSION),
        }
      } else {
        return {
          response: this.apiService.createErrorResponse(Messages.EXPIRED_PROTOCOL_VERSION),
        }
      }
    }

    if (Common.isProtocolVersionExpired(keyParams.version)) {
      /* Cost minimums only apply to now outdated versions (001 and 002) */
      const minimum = this.protocolService.costMinimumForVersion(keyParams.version)
      if (keyParams.content002.pw_cost < minimum) {
        return {
          response: this.apiService.createErrorResponse(Messages.INVALID_PASSWORD_COST),
        }
      }

      const expiredMessages = Strings.Confirm.ProtocolVersionExpired(keyParams.version)
      const confirmed = await this.alertService.confirm(
        expiredMessages.Message,
        expiredMessages.Title,
        expiredMessages.ConfirmButton,
      )

      if (!confirmed) {
        return {
          response: this.apiService.createErrorResponse(Messages.API_MESSAGE_FALLBACK_LOGIN_FAIL),
        }
      }
    }

    if (!this.protocolService.platformSupportsKeyDerivation(keyParams)) {
      return {
        response: this.apiService.createErrorResponse(Messages.UNSUPPORTED_KEY_DERIVATION),
      }
    }

    if (strict) {
      minAllowedVersion = this.protocolService.getLatestVersion()
    }

    if (!isNullOrUndefined(minAllowedVersion)) {
      if (!Common.leftVersionGreaterThanOrEqualToRight(keyParams.version, minAllowedVersion)) {
        return {
          response: this.apiService.createErrorResponse(
            Messages.StrictSignInFailed(keyParams.version, minAllowedVersion),
          ),
        }
      }
    }
    const rootKey = await this.protocolService.computeRootKey(password, keyParams)
    const signInResponse = await this.bypassChecksAndSignInWithRootKey(
      email,
      rootKey,
      paramsResult.mfaKeyPath,
      paramsResult.mfaCode,
      ephemeral,
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
    ephemeral = false,
  ): Promise<Responses.SignInResponse | Responses.HttpResponse> {
    const { wrappingKey, canceled } = await this.challengeService.getWrappingKeyIfApplicable()
    if (canceled) {
      return this.apiService.createErrorResponse(
        SignInStrings.PasscodeRequired,
        Responses.StatusCode.LocalValidationError,
      )
    }
    const signInResponse = await this.apiService.signIn(
      email,
      rootKey.serverPassword!,
      mfaKeyPath,
      mfaCode,
      ephemeral,
    )
    if (!signInResponse.error && signInResponse.data) {
      const expandedRootKey = new SNRootKey(
        CopyPayloadWithContentOverride(rootKey.payload, {
          keyParams: (signInResponse as Responses.SignInResponse).data.key_params,
        }),
      )
      await this.handleSuccessAuthResponse(
        signInResponse as Responses.SignInResponse,
        expandedRootKey,
        wrappingKey,
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
            Responses.StatusCode.CanceledMfa,
          )
        }
        return this.bypassChecksAndSignInWithRootKey(
          email,
          rootKey,
          signInResponse.error.payload.mfa_key,
          inputtedCode,
        )
      } else {
        /** Some other error, return to caller */
        return signInResponse
      }
    }
  }

  public async changeCredentials(parameters: {
    currentServerPassword: string
    newRootKey: SNRootKey
    wrappingKey?: SNRootKey
    newEmail?: string
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
      response as Responses.ChangeCredentialsResponse,
      parameters.newRootKey,
      parameters.wrappingKey,
    )
  }

  public async getSessionsList(): Promise<
    (Responses.HttpResponse & { data: RemoteSession[] }) | Responses.HttpResponse
  > {
    const response = await this.apiService.getSessionsList()
    if (response.error || isNullOrUndefined(response.data)) {
      return response
    }
    ;(
      response as Responses.HttpResponse & {
        data: RemoteSession[]
      }
    ).data = (response as Responses.SessionListResponse).data
      .map<RemoteSession>((session) => ({
        ...session,
        updated_at: new Date(session.updated_at),
      }))
      .sort((s1: RemoteSession, s2: RemoteSession) => (s1.updated_at < s2.updated_at ? 1 : -1))
    return response
  }

  public async revokeSession(sessionId: UuidString): Promise<Responses.HttpResponse> {
    const response = await this.apiService.deleteSession(sessionId)
    return response
  }

  public async revokeAllOtherSessions(): Promise<void> {
    const response = await this.getSessionsList()
    if (response.error != undefined || response.data == undefined) {
      throw new Error(response.error?.message ?? Messages.API_MESSAGE_GENERIC_SYNC_FAIL)
    }
    const sessions = response.data as RemoteSession[]
    const otherSessions = sessions.filter((session) => !session.current)
    await Promise.all(otherSessions.map((session) => this.revokeSession(session.uuid)))
  }

  private async processChangeCredentialsResponse(
    response: Responses.ChangeCredentialsResponse,
    newRootKey: SNRootKey,
    wrappingKey?: SNRootKey,
  ): Promise<SessionManagerResponse> {
    if (!response.error && response.data) {
      await this.handleSuccessAuthResponse(
        response as Responses.ChangeCredentialsResponse,
        newRootKey,
        wrappingKey,
      )
    }
    return {
      response: response,
      keyParams: (response as Responses.ChangeCredentialsResponse).data?.key_params,
    }
  }

  public async createDemoShareToken(): Promise<Base64String | ClientDisplayableError> {
    const session = this.getSession()
    if (!session) {
      return new ClientDisplayableError('Cannot generate share token without active session')
    }
    if (!(session instanceof TokenSession)) {
      return new ClientDisplayableError('Cannot generate share token with non-token session')
    }

    const keyParams = (await this.protocolService.getRootKeyParams()) as SNRootKeyParams

    const payload: ShareToken = {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      accessExpiration: session.accessExpiration,
      refreshExpiration: session.refreshExpiration,
      readonlyAccess: true,
      masterKey: this.protocolService.getRootKey()?.masterKey as string,
      keyParams: keyParams.content,
      user: this.getSureUser(),
      host: this.apiService.getHost(),
    }

    return this.protocolService.crypto.base64Encode(JSON.stringify(payload))
  }

  private decodeDemoShareToken(token: Base64String): ShareToken {
    const jsonString = this.protocolService.crypto.base64Decode(token)
    return JSON.parse(jsonString)
  }

  public async populateSessionFromDemoShareToken(token: Base64String): Promise<void> {
    const sharePayload = this.decodeDemoShareToken(token)

    const rootKey = CreateNewRootKey({
      masterKey: sharePayload.masterKey,
      keyParams: sharePayload.keyParams,
      version: sharePayload.keyParams.version,
    })

    const user = sharePayload.user

    const session = new TokenSession(
      sharePayload.accessToken,
      sharePayload.accessExpiration,
      sharePayload.refreshToken,
      sharePayload.refreshExpiration,
      sharePayload.readonlyAccess,
    )

    await this.populateSession(rootKey, user, session, sharePayload.host)
  }

  private async populateSession(
    rootKey: SNRootKey,
    user: Responses.User,
    session: Session,
    host: string,
    wrappingKey?: SNRootKey,
  ) {
    await this.protocolService.setRootKey(rootKey, wrappingKey)

    this.setUser(user)

    await this.storageService.setValue(StorageKey.User, user)

    void this.apiService.setHost(host)

    await this.setSession(session)

    this.webSocketsService.startWebSocketConnection(session.authorizationValue)
  }

  private async handleSuccessAuthResponse(
    response:
      | Responses.RegistrationResponse
      | Responses.SignInResponse
      | Responses.ChangeCredentialsResponse,
    rootKey: SNRootKey,
    wrappingKey?: SNRootKey,
  ) {
    const { data } = response
    const user = data.user as Responses.User

    const isLegacyJwtResponse = data.token != undefined
    if (isLegacyJwtResponse) {
      const session = new JwtSession(data.token as string)
      await this.populateSession(rootKey, user, session, this.apiService.getHost(), wrappingKey)
    } else if (data.session) {
      const session = TokenSession.FromApiResponse(response)
      await this.populateSession(rootKey, user, session, this.apiService.getHost(), wrappingKey)
    }
  }
}

import {
  Challenge,
  ChallengeValidation,
  ChallengeReason,
  ChallengePrompt,
  ChallengeService,
} from '@Lib/Services/Challenge'
import { SNLog } from '@Lib/Log'
import { SNFile, SNNote } from '@standardnotes/models'
import { EncryptionService } from '@standardnotes/encryption'
import { SNStorageService } from '@Lib/Services/Storage/StorageService'
import { StorageKey } from '@standardnotes/services'
import { isNullOrUndefined } from '@standardnotes/utils'
import { ApplicationStage } from '@standardnotes/services'
import {
  AbstractService,
  InternalEventBusInterface,
  StorageValueModes,
} from '@standardnotes/services'
import { ProtectionsClientInterface } from './ClientInterface'

export enum ProtectionEvent {
  UnprotectedSessionBegan = 'UnprotectedSessionBegan',
  UnprotectedSessionExpired = 'UnprotectedSessionExpired',
}

export const ProposedSecondsToDeferUILevelSessionExpirationDuringActiveInteraction = 30

export enum UnprotectedAccessSecondsDuration {
  OneMinute = 60,
  FiveMinutes = 300,
  OneHour = 3600,
  OneWeek = 604800,
}

export function isValidProtectionSessionLength(number: unknown): boolean {
  return (
    typeof number === 'number' && Object.values(UnprotectedAccessSecondsDuration).includes(number)
  )
}

export const ProtectionSessionDurations = [
  {
    valueInSeconds: UnprotectedAccessSecondsDuration.OneMinute,
    label: '1 Minute',
  },
  {
    valueInSeconds: UnprotectedAccessSecondsDuration.FiveMinutes,
    label: '5 Minutes',
  },
  {
    valueInSeconds: UnprotectedAccessSecondsDuration.OneHour,
    label: '1 Hour',
  },
  {
    valueInSeconds: UnprotectedAccessSecondsDuration.OneWeek,
    label: '1 Week',
  },
]

/**
 * Enforces certain actions to require extra authentication,
 * like viewing a protected note, as well as managing how long that
 * authentication should be valid for.
 */
export class SNProtectionService
  extends AbstractService<ProtectionEvent>
  implements ProtectionsClientInterface
{
  private sessionExpiryTimeout = -1

  constructor(
    private protocolService: EncryptionService,
    private challengeService: ChallengeService,
    private storageService: SNStorageService,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  public deinit(): void {
    clearTimeout(this.sessionExpiryTimeout)
    ;(this.protocolService as unknown) = undefined
    ;(this.challengeService as unknown) = undefined
    ;(this.storageService as unknown) = undefined
    super.deinit()
  }

  handleApplicationStage(stage: ApplicationStage): Promise<void> {
    if (stage === ApplicationStage.LoadedDatabase_12) {
      this.updateSessionExpiryTimer(this.getSessionExpiryDate())
    }
    return Promise.resolve()
  }

  public hasProtectionSources(): boolean {
    return (
      this.protocolService.hasAccount() ||
      this.protocolService.hasPasscode() ||
      this.hasBiometricsEnabled()
    )
  }

  public hasUnprotectedAccessSession(): boolean {
    if (!this.hasProtectionSources()) {
      return true
    }
    return this.getSessionExpiryDate() > new Date()
  }

  public hasBiometricsEnabled(): boolean {
    const biometricsState = this.storageService.getValue(
      StorageKey.BiometricsState,
      StorageValueModes.Nonwrapped,
    )
    return Boolean(biometricsState)
  }

  public async enableBiometrics(): Promise<boolean> {
    if (this.hasBiometricsEnabled()) {
      SNLog.onError(Error('Tried to enable biometrics when they already are enabled.'))
      return false
    }
    await this.storageService.setValue(
      StorageKey.BiometricsState,
      true,
      StorageValueModes.Nonwrapped,
    )
    return true
  }

  public async disableBiometrics(): Promise<boolean> {
    if (!this.hasBiometricsEnabled()) {
      SNLog.onError(Error('Tried to disable biometrics when they already are disabled.'))
      return false
    }
    if (await this.validateOrRenewSession(ChallengeReason.DisableBiometrics)) {
      await this.storageService.setValue(
        StorageKey.BiometricsState,
        false,
        StorageValueModes.Nonwrapped,
      )
      return true
    } else {
      return false
    }
  }

  public createLaunchChallenge(): Challenge | undefined {
    const prompts: ChallengePrompt[] = []
    if (this.hasBiometricsEnabled()) {
      prompts.push(new ChallengePrompt(ChallengeValidation.Biometric))
    }
    if (this.protocolService.hasPasscode()) {
      prompts.push(new ChallengePrompt(ChallengeValidation.LocalPasscode))
    }
    if (prompts.length > 0) {
      return new Challenge(prompts, ChallengeReason.ApplicationUnlock, false)
    } else {
      return undefined
    }
  }

  async authorizeProtectedActionForFiles(
    files: SNFile[],
    challengeReason: ChallengeReason,
  ): Promise<SNFile[]> {
    let sessionValidation: Promise<boolean> | undefined
    const authorizedFiles = []
    for (const file of files) {
      const needsAuthorization = file.protected && !this.hasUnprotectedAccessSession()
      if (needsAuthorization && !sessionValidation) {
        sessionValidation = this.validateOrRenewSession(challengeReason)
      }
      if (!needsAuthorization || (await sessionValidation)) {
        authorizedFiles.push(file)
      }
    }
    return authorizedFiles
  }

  async authorizeProtectedActionForNotes(
    notes: SNNote[],
    challengeReason: ChallengeReason,
  ): Promise<SNNote[]> {
    let sessionValidation: Promise<boolean> | undefined
    const authorizedNotes = []
    for (const note of notes) {
      const needsAuthorization = note.protected && !this.hasUnprotectedAccessSession()
      if (needsAuthorization && !sessionValidation) {
        sessionValidation = this.validateOrRenewSession(challengeReason)
      }
      if (!needsAuthorization || (await sessionValidation)) {
        authorizedNotes.push(note)
      }
    }
    return authorizedNotes
  }

  async authorizeNoteAccess(note: SNNote): Promise<boolean> {
    if (!note.protected) {
      return true
    }

    return this.authorizeAction(ChallengeReason.AccessProtectedNote)
  }

  authorizeAddingPasscode(): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.AddPasscode)
  }

  authorizeChangingPasscode(): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.ChangePasscode)
  }

  authorizeRemovingPasscode(): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.RemovePasscode)
  }

  authorizeSearchingProtectedNotesText(): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.SearchProtectedNotesText)
  }

  authorizeFileImport(): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.ImportFile)
  }

  async authorizeBackupCreation(encrypted: boolean): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.ExportBackup, {
      fallBackToAccountPassword: encrypted,
    })
  }

  async authorizeMfaDisable(): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.DisableMfa, {
      requireAccountPassword: true,
    })
  }

  async authorizeAutolockIntervalChange(): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.ChangeAutolockInterval)
  }

  async authorizeSessionRevoking(): Promise<boolean> {
    return this.authorizeAction(ChallengeReason.RevokeSession)
  }

  async authorizeAction(
    reason: ChallengeReason,
    { fallBackToAccountPassword = true, requireAccountPassword = false } = {},
  ): Promise<boolean> {
    return this.validateOrRenewSession(reason, {
      requireAccountPassword,
      fallBackToAccountPassword,
    })
  }

  private async validateOrRenewSession(
    reason: ChallengeReason,
    { fallBackToAccountPassword = true, requireAccountPassword = false } = {},
  ): Promise<boolean> {
    if (this.getSessionExpiryDate() > new Date()) {
      return true
    }

    const prompts: ChallengePrompt[] = []
    if (this.hasBiometricsEnabled()) {
      prompts.push(new ChallengePrompt(ChallengeValidation.Biometric))
    }
    if (this.protocolService.hasPasscode()) {
      prompts.push(new ChallengePrompt(ChallengeValidation.LocalPasscode))
    }
    if (requireAccountPassword) {
      if (!this.protocolService.hasAccount()) {
        throw Error('Requiring account password for challenge with no account')
      }
      prompts.push(new ChallengePrompt(ChallengeValidation.AccountPassword))
    }
    if (prompts.length === 0) {
      if (fallBackToAccountPassword && this.protocolService.hasAccount()) {
        prompts.push(new ChallengePrompt(ChallengeValidation.AccountPassword))
      } else {
        return true
      }
    }
    const lastSessionLength = this.getLastSessionLength()
    const chosenSessionLength = isValidProtectionSessionLength(lastSessionLength)
      ? lastSessionLength
      : UnprotectedAccessSecondsDuration.OneMinute
    prompts.push(
      new ChallengePrompt(
        ChallengeValidation.ProtectionSessionDuration,
        undefined,
        undefined,
        undefined,
        undefined,
        chosenSessionLength,
      ),
    )
    const response = await this.challengeService.promptForChallengeResponse(
      new Challenge(prompts, reason, true),
    )
    if (response) {
      const length = response.values.find(
        (value) => value.prompt.validation === ChallengeValidation.ProtectionSessionDuration,
      )?.value
      if (isNullOrUndefined(length)) {
        SNLog.error(Error('No valid protection session length found. Got ' + length))
      } else {
        await this.setSessionLength(length as UnprotectedAccessSecondsDuration)
      }
      return true
    } else {
      return false
    }
  }

  public getSessionExpiryDate(): Date {
    const expiresAt = this.storageService.getValue<number>(StorageKey.ProtectionExpirey)
    if (expiresAt) {
      return new Date(expiresAt)
    } else {
      return new Date()
    }
  }

  public clearSession(): Promise<void> {
    void this.setSessionExpiryDate(new Date())
    return this.notifyEvent(ProtectionEvent.UnprotectedSessionExpired)
  }

  private async setSessionExpiryDate(date: Date) {
    await this.storageService.setValue(StorageKey.ProtectionExpirey, date)
  }

  private getLastSessionLength(): UnprotectedAccessSecondsDuration | undefined {
    return this.storageService.getValue(StorageKey.ProtectionSessionLength)
  }

  private async setSessionLength(length: UnprotectedAccessSecondsDuration): Promise<void> {
    await this.storageService.setValue(StorageKey.ProtectionSessionLength, length)
    const expiresAt = new Date()
    expiresAt.setSeconds(expiresAt.getSeconds() + length)
    await this.setSessionExpiryDate(expiresAt)
    this.updateSessionExpiryTimer(expiresAt)
    void this.notifyEvent(ProtectionEvent.UnprotectedSessionBegan)
  }

  private updateSessionExpiryTimer(expiryDate: Date) {
    clearTimeout(this.sessionExpiryTimeout)
    const timer: TimerHandler = () => {
      void this.clearSession()
    }
    this.sessionExpiryTimeout = setTimeout(timer, expiryDate.getTime() - Date.now())
  }
}
import {
  Challenge,
  ChallengePrompt,
  ChallengeReason,
  ChallengeValidation,
} from '@Lib/challenges';
import { ChallengeService } from './challenge/challenge_service';
import { PureService } from '@Lib/services/pure_service';
import { SNLog } from '@Lib/log';
import { NoteMutator, SNNote } from '@Lib/models';
import { SNProtocolService } from './protocol_service';
import { SNStorageService, StorageValueModes } from '@Services/storage_service';
import { StorageKey } from '@Lib/storage_keys';
import { isNullOrUndefined } from '@Lib/utils';
import { ApplicationStage } from '@Lib/stages';
import { ItemManager } from './item_manager';
import { Uuids } from '@Lib/models/functions';
import { DURATION_TO_POSTPONE_PROTECTED_NOTE_LOCK_WHILE_EDITING } from '@Lib/constants';

export enum ProtectionEvent {
  SessionExpiryDateChanged = 'SessionExpiryDateChanged',
}

enum ProtectionSessionLengthSeconds {
  None = 0,
  FiveMinutes = 300,
  OneHour = 3600,
  OneWeek = 604800,
}

export function isValidProtectionSessionLength(number: unknown): boolean {
  return (
    typeof number === 'number' &&
    Object.values(ProtectionSessionLengthSeconds).includes(number)
  );
}

export const ProtectionSessionDurations = [
  {
    valueInSeconds: ProtectionSessionLengthSeconds.None,
    label: "Don't Remember",
  },
  {
    valueInSeconds: ProtectionSessionLengthSeconds.FiveMinutes,
    label: '5 Minutes',
  },
  {
    valueInSeconds: ProtectionSessionLengthSeconds.OneHour,
    label: '1 Hour',
  },
  {
    valueInSeconds: ProtectionSessionLengthSeconds.OneWeek,
    label: '1 Week',
  },
];

/**
 * Enforces certain actions to require extra authentication,
 * like viewing a protected note, as well as managing how long that
 * authentication should be valid for.
 */
export class SNProtectionService extends PureService<ProtectionEvent.SessionExpiryDateChanged> {
  private sessionExpiryTimeout = -1;

  constructor(
    private protocolService: SNProtocolService,
    private challengeService: ChallengeService,
    private storageService: SNStorageService,
    private itemManager: ItemManager
  ) {
    super();
  }

  public deinit(): void {
    (this.protocolService as unknown) = undefined;
    (this.challengeService as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    (this.itemManager as unknown) = undefined;
    super.deinit();
  }

  handleApplicationStage(stage: ApplicationStage): Promise<void> {
    if (stage === ApplicationStage.LoadedDatabase_12) {
      this.updateSessionExpiryTimer(this.getSessionExpiryDate());
    }
    return Promise.resolve();
  }

  public hasProtectionSources(): boolean {
    return (
      this.protocolService.hasAccount() ||
      this.protocolService.hasPasscode() ||
      this.hasBiometricsEnabled()
    );
  }

  public areProtectionsEnabled(): boolean {
    return (
      this.hasProtectionSources() && this.getSessionExpiryDate() <= new Date()
    );
  }

  public hasBiometricsEnabled(): boolean {
    const biometricsState = this.storageService.getValue(
      StorageKey.BiometricsState,
      StorageValueModes.Nonwrapped
    );
    return Boolean(biometricsState);
  }

  public async enableBiometrics(): Promise<boolean> {
    if (this.hasBiometricsEnabled()) {
      SNLog.onError(
        Error('Tried to enable biometrics when they already are enabled.')
      );
      return false;
    }
    await this.storageService.setValue(
      StorageKey.BiometricsState,
      true,
      StorageValueModes.Nonwrapped
    );
    return true;
  }

  public async disableBiometrics(): Promise<boolean> {
    if (!this.hasBiometricsEnabled()) {
      SNLog.onError(
        Error('Tried to disable biometrics when they already are disabled.')
      );
      return false;
    }
    if (await this.validateOrRenewSession(ChallengeReason.DisableBiometrics)) {
      await this.storageService.setValue(
        StorageKey.BiometricsState,
        false,
        StorageValueModes.Nonwrapped
      );
      return true;
    } else {
      return false;
    }
  }

  public createLaunchChallenge(): Challenge | undefined {
    const prompts: ChallengePrompt[] = [];
    if (this.hasBiometricsEnabled()) {
      prompts.push(new ChallengePrompt(ChallengeValidation.Biometric));
    }
    if (this.protocolService.hasPasscode()) {
      prompts.push(new ChallengePrompt(ChallengeValidation.LocalPasscode));
    }
    if (prompts.length > 0) {
      return new Challenge(prompts, ChallengeReason.ApplicationUnlock, false);
    } else {
      return undefined;
    }
  }

  protectNote(note: SNNote): Promise<SNNote> {
    return this.itemManager.changeItem<NoteMutator>(note.uuid, (mutator) => {
      mutator.protected = true;
    }) as Promise<SNNote>;
  }

  async unprotectNote(note: SNNote): Promise<SNNote | undefined> {
    if (await this.validateOrRenewSession(ChallengeReason.UnprotectNote)) {
      return this.itemManager.changeItem<NoteMutator>(note.uuid, (mutator) => {
        mutator.protected = false;
      }) as Promise<SNNote>;
    }
  }

  async authorizeProtectedActionForNotes(
    notes: SNNote[],
    challengeReason: ChallengeReason
  ): Promise<SNNote[]> {
    let sessionValidation: Promise<boolean> | undefined;
    const authorizedNotes = [];
    for (const note of notes) {
      const isProtected = note.protected && this.areProtectionsEnabled();
      if (isProtected && !sessionValidation) {
        sessionValidation = this.validateOrRenewSession(challengeReason);
      }
      if (!isProtected || (await sessionValidation)) {
        authorizedNotes.push(note);
      }
    }
    return authorizedNotes;
  }

  protectNotes(notes: SNNote[]): Promise<SNNote[]> {
    return this.itemManager.changeItems<NoteMutator>(
      Uuids(notes),
      (mutator) => {
        mutator.protected = true;
      }
    ) as Promise<SNNote[]>;
  }

  async unprotectNotes(notes: SNNote[]): Promise<SNNote[]> {
    const authorizedNotes = await this.authorizeProtectedActionForNotes(
      notes,
      ChallengeReason.UnprotectNote
    );
    return this.itemManager.changeItems<NoteMutator>(
      Uuids(authorizedNotes),
      (mutator) => {
        mutator.protected = false;
      }
    ) as Promise<SNNote[]>;
  }

  async authorizeNoteAccess(note: SNNote): Promise<boolean> {
    if (!note.protected) {
      return true;
    }

    return this.validateOrRenewSession(ChallengeReason.AccessProtectedNote);
  }

  authorizeAddingPasscode(): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.AddPasscode);
  }

  authorizeChangingPasscode(): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.ChangePasscode);
  }

  authorizeRemovingPasscode(): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.RemovePasscode);
  }

  authorizeSearchingProtectedNotesText(): Promise<boolean> {
    return this.validateOrRenewSession(
      ChallengeReason.SearchProtectedNotesText
    );
  }

  authorizeFileImport(): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.ImportFile);
  }

  async authorizeBackupCreation(encrypted: boolean): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.ExportBackup, {
      fallBackToAccountPassword: encrypted,
    });
  }

  async authorizeMfaDisable(): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.DisableMfa, {
      requireAccountPassword: true,
    });
  }

  async authorizeAutolockIntervalChange(): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.ChangeAutolockInterval);
  }

  async authorizeSessionRevoking(): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.RevokeSession);
  }

  authorizeCloudLinkAccess(): Promise<boolean> {
    return this.validateOrRenewSession(ChallengeReason.AccessCloudLink);
  }

  private async validateOrRenewSession(
    reason: ChallengeReason,
    { fallBackToAccountPassword = true, requireAccountPassword = false } = {}
  ): Promise<boolean> {
    if (this.getSessionExpiryDate() > new Date()) {
      return true;
    }

    const prompts: ChallengePrompt[] = [];
    if (this.hasBiometricsEnabled()) {
      prompts.push(new ChallengePrompt(ChallengeValidation.Biometric));
    }
    if (this.protocolService.hasPasscode()) {
      prompts.push(new ChallengePrompt(ChallengeValidation.LocalPasscode));
    }
    if (requireAccountPassword) {
      if (!this.protocolService.hasAccount()) {
        throw Error('Requiring account password for challenge with no account');
      }
      prompts.push(new ChallengePrompt(ChallengeValidation.AccountPassword));
    }
    if (prompts.length === 0) {
      if (fallBackToAccountPassword && this.protocolService.hasAccount()) {
        prompts.push(new ChallengePrompt(ChallengeValidation.AccountPassword));
      } else {
        return true;
      }
    }

    prompts.push(
      new ChallengePrompt(
        ChallengeValidation.ProtectionSessionDuration,
        undefined,
        undefined,
        undefined,
        undefined,
        await this.getSessionLength()
      )
    );

    const response = await this.challengeService.promptForChallengeResponse(
      new Challenge(prompts, reason, true)
    );
    if (response) {
      const length = response.values.find(
        (value) =>
          value.prompt.validation ===
          ChallengeValidation.ProtectionSessionDuration
      )?.value;
      if (isNullOrUndefined(length)) {
        SNLog.error(
          Error('No valid protection session length found. Got ' + length)
        );
      } else {
        // If the user sets protection session duration to "0" ("Don't remember" option in the authentication popup),
        // then give them some time to edit the note (defined in DURATION_TO_POSTPONE_PROTECTED_NOTE_LOCK_WHILE_EDITING)
        // and enable autolock after that time has passed.
        const sessionLength = length === ProtectionSessionLengthSeconds.None ? DURATION_TO_POSTPONE_PROTECTED_NOTE_LOCK_WHILE_EDITING : length;
        await this.setSessionLength(sessionLength as ProtectionSessionLengthSeconds);
      }
      return true;
    } else {
      return false;
    }
  }

  public getSessionExpiryDate(): Date {
    const expiresAt = this.storageService.getValue(
      StorageKey.ProtectionExpirey
    );
    if (expiresAt) {
      return new Date(expiresAt);
    } else {
      return new Date();
    }
  }

  public clearSession(): Promise<void> {
    return this.setSessionExpiryDate(new Date());
  }

  public async updateProtectionExpiryDateIfRequired(selectedProtectedNotes: SNNote[]): Promise<void> {
    const sessionExpiryDate = this.getSessionExpiryDate();
    for await (const note of selectedProtectedNotes) {
      const secondsBetweenLastEditAndProtectionExpirationInSeconds = (sessionExpiryDate.getTime() - note.userModifiedDate.getTime()) / 1000;
      if (secondsBetweenLastEditAndProtectionExpirationInSeconds < DURATION_TO_POSTPONE_PROTECTED_NOTE_LOCK_WHILE_EDITING) {
        await this.setSessionLength(DURATION_TO_POSTPONE_PROTECTED_NOTE_LOCK_WHILE_EDITING);
      }
    }
  }

  private async setSessionExpiryDate(date: Date) {
    await this.storageService.setValue(StorageKey.ProtectionExpirey, date);
    void this.notifyEvent(ProtectionEvent.SessionExpiryDateChanged);
  }

  private async getSessionLength(): Promise<number> {
    const length = await this.storageService.getValue(
      StorageKey.ProtectionSessionLength
    );
    if (length) {
      return length;
    } else {
      return ProtectionSessionLengthSeconds.None;
    }
  }

  private async setSessionLength(
    length: ProtectionSessionLengthSeconds
  ): Promise<void> {
    await this.storageService.setValue(
      StorageKey.ProtectionSessionLength,
      length
    );
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + length);
    await this.setSessionExpiryDate(expiresAt);
    this.updateSessionExpiryTimer(expiresAt);
  }

  private updateSessionExpiryTimer(expiryDate: Date) {
    const expiryTime = expiryDate.getTime();
    if (expiryTime > Date.now()) {
      const timer: TimerHandler = () => {
        void this.setSessionExpiryDate(new Date());
      };
      clearTimeout(this.sessionExpiryTimeout);
      this.sessionExpiryTimeout = setTimeout(timer, expiryTime - Date.now());
    }
  }
}

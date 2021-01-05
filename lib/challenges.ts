import { Migration } from '@Lib/migrations/migration';
import { ChallengeModalTitle, ChallengeStrings, PromptTitles } from './services/api/messages';
import { SNRootKey } from '@Protocol/root_key';
import { isNullOrUndefined } from './utils';

export type ChallengeArtifacts = {
  wrappingKey?: SNRootKey
  rootKey?: SNRootKey
}

export enum ChallengeValidation {
  None = 0,
  LocalPasscode = 1,
  AccountPassword = 2,
  Biometric = 3,
  ProtectedNoteAccessDuration = 4,
}

/** The source of the challenge */
export enum ChallengeReason {
  ApplicationUnlock = 1,
  ResaveRootKey = 2,
  ProtocolUpgrade = 3,
  Migration = 4,
  Custom = 5,
  AccessProtectedNote = 6,
}

/** For mobile */
export enum ChallengeKeyboardType {
  Alphanumeric = 'default',
  Numeric = 'numeric'
}

/**
 * A challenge is a stateless description of what the client needs to provide
 * in order to proceed.
 */
export class Challenge {
  public readonly id = Math.random();

  constructor(
    public readonly prompts: ChallengePrompt[],
    public readonly reason: ChallengeReason,
    public readonly cancelable: boolean,
    public readonly _heading?: string,
    public readonly _subheading?: string,
  ) {
    Object.freeze(this);
  }

  /** Outside of the modal, this is the title of the modal itself */
  get modalTitle(): string {
    switch (this.reason) {
      case ChallengeReason.Migration:
        return ChallengeModalTitle.Migration;
      default:
        return ChallengeModalTitle.Generic;
    }
  }

  /** Inside of the modal, this is the H1 */
  get heading(): string | undefined {
    if (this._heading) {
      return this._heading;
    } else {
      switch (this.reason) {
        case ChallengeReason.ApplicationUnlock:
          return ChallengeStrings.UnlockApplication;
        case ChallengeReason.Migration:
          return ChallengeStrings.EnterLocalPasscode;
        case ChallengeReason.ResaveRootKey:
          return ChallengeStrings.EnterPasscodeForRootResave;
        case ChallengeReason.ProtocolUpgrade:
          return ChallengeStrings.EnterCredentialsForProtocolUpgrade;
        case ChallengeReason.AccessProtectedNote:
          return ChallengeStrings.NoteAccess;
        default:
          return undefined;
      }
    }
  }

  /** Inside of the modal, this is the H2 */
  get subheading(): string | undefined {
    if (this._subheading) {
      return this._subheading;
    }

    switch (this.reason) {
      case ChallengeReason.Migration:
        return ChallengeStrings.EnterPasscodeForMigration;
      default:
        return undefined;
    }
  }

  hasPromptForValidationType(type: ChallengeValidation): boolean {
    for (const prompt of this.prompts) {
      if (prompt.validation === type) {
        return true;
      }
    }
    return false;
  }
}

type ChallengeRawValue = number | string | boolean;

/**
 * A Challenge can have many prompts. Each prompt represents a unique input,
 * such as a text field, or biometric scanner.
 */
export class ChallengePrompt {
  public readonly id = Math.random();
  constructor(
    public readonly validation: ChallengeValidation,
    public readonly _title?: string,
    public readonly placeholder?: string,
    public readonly secureTextEntry = true,
    public readonly keyboardType?: ChallengeKeyboardType,
    public readonly initialValue?: ChallengeRawValue,
  ) {
    Object.freeze(this);
  }

  public get validates(): boolean {
    return this.validation !== ChallengeValidation.None;
  }

  public get title(): string | undefined {
    if (this._title) {
      return this._title;
    }
    switch (this.validation) {
      case ChallengeValidation.AccountPassword:
        return PromptTitles.AccountPassword;
      case ChallengeValidation.Biometric:
        return PromptTitles.Biometrics;
      case ChallengeValidation.LocalPasscode:
        return PromptTitles.LocalPasscode;
      case ChallengeValidation.ProtectedNoteAccessDuration:
        return PromptTitles.RememberFor;
      default:
        return undefined;
    }
  }
}

export class ChallengeValue {
  constructor(
    public readonly prompt: ChallengePrompt,
    public readonly value: ChallengeRawValue,
  ) {
    Object.freeze(this);
  }
}

export class ChallengeResponse {
  constructor(
    public readonly challenge: Challenge,
    public readonly values: ChallengeValue[],
    public readonly artifacts?: ChallengeArtifacts,
  ) {
    Object.freeze(this);
  }

  getValueForType(type: ChallengeValidation): ChallengeValue {
    const value = this.values.find((value) => value.prompt.validation === type);
    if (isNullOrUndefined(value)) {
      throw Error('Could not find value for validation type ' + type);
    }
    return value;
  }

  getDefaultValue(): ChallengeValue {
    if (this.values.length > 1) {
      throw Error('Attempting to retrieve default response value when more than one value exists');
    }
    return this.values[0];
  }
}

import { ChallengeStrings } from './services/api/messages';
import { SNRootKey } from '@Protocol/root_key';

export type ChallengeArtifacts = {
  wrappingKey?: SNRootKey
  rootKey?: SNRootKey
}

export enum ChallengeValidation {
  None = 0,
  LocalPasscode = 1,
  AccountPassword = 2,
  Biometric = 3,
};
/** The source of the challenge */
export enum ChallengeReason {
  ApplicationUnlock = 1,
  ResaveRootKey = 2,
  ProtocolUpgrade = 3,
  Migration = 4,
  Custom = 5
};

/**
 * A challenge is a stateless description of what the client needs to provide
 * in order to proceed.
 */
export class Challenge {
  public readonly id = Math.random();

  constructor(
    public readonly prompts: ChallengePrompt[],
    public readonly reason: ChallengeReason,
    public readonly _title?: string,
    public readonly _subtitle?: string
  ) {
    Object.freeze(this);
  }

  get title() {
    if(this._title) {
      return this._title;
    } else {
      switch (this.reason) {
        case ChallengeReason.ApplicationUnlock:
          return ChallengeStrings.UnlockApplication;
        case ChallengeReason.Migration:
          return ChallengeStrings.EnterPasscodeForMigration;
        case ChallengeReason.ResaveRootKey:
          return ChallengeStrings.EnterPasscodeForLoginRegister;
        default:
          return ChallengeStrings.EnterAccountPassword;
      }
    }
  }

  get subtitle() {
    return this._subtitle;
  }

  hasPromptForValidationType(type: ChallengeValidation) {
    for (const prompt of this.prompts) {
      if(prompt.validation === type) {
        return true;
      }
    }
    return false;
  }
}

/**
 * A Challenge can have many prompts. Each prompt represents a unique input,
 * such as a text field, or biometric scanner.
 */
export class ChallengePrompt {
  public readonly id = Math.random();
  constructor(
    public readonly validation: ChallengeValidation,
    public readonly title?: string,
    public readonly placeholder?: string,
    public readonly secureTextEntry = true
  ) {
    Object.freeze(this);
  }

  public get validates() {
    return this.validation !== ChallengeValidation.None;
  }
}

export class ChallengeValue {
  constructor(
    public readonly prompt: ChallengePrompt,
    public readonly value: string | boolean,
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

  getValueForType(type: ChallengeValidation) {
    return this.values.find((value) => value.prompt.validation === type)!;
  }

  getDefaultValue() {
    if (this.values.length > 1) {
      throw Error('Attempting to retrieve default response value when more than one value exists');
    }
    return this.values[0];
  }
}

/**
 * @returns The UI-friendly title for this challenge
 */
export function challengeTypeToString(type: ChallengeValidation) {
  const mapping = {
    [ChallengeValidation.LocalPasscode]: 'application passcode',
    [ChallengeValidation.AccountPassword]: 'account password',
    [ChallengeValidation.Biometric]: 'biometrics',
    [ChallengeValidation.None]: 'custom',
  };
  return mapping[type];
}

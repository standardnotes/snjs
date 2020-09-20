import { SNRootKey } from '@Protocol/root_key';

export type ChallengeArtifacts = {
  wrappingKey?: SNRootKey
  rootKey?: SNRootKey
}

export enum ChallengeType {
  LocalPasscode = 1,
  AccountPassword = 2,
  Biometric = 3,
  Custom = 4
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
  public readonly id = new Date().getTime();

  constructor(
    public readonly types: ChallengeType[],
    public readonly reason: ChallengeReason,
    /** A prompt is akin to the modal title */
    public readonly customPrompt?: string,
    /** A reason is akin to the modal subtitle */
    public readonly customReason?: string,
    /** The name of the input fields to correspond with `types`, if using custom prompts */
    public readonly customInputNames?: string[],
  ) {
    Object.freeze(this);
  }
}

export class ChallengeValue {
  constructor(
    public readonly type: ChallengeType,
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

  getValueForType(type: ChallengeType) {
    return this.values.find((value) => value.type === type)!;
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
export function challengeTypeToString(type: ChallengeType) {
  const mapping = {
    [ChallengeType.LocalPasscode]: 'application passcode',
    [ChallengeType.AccountPassword]: 'account password',
    [ChallengeType.Biometric]: 'biometrics',
    [ChallengeType.Custom]: 'custom',
  };
  return mapping[type];
}


export type ChallengeArtifacts = Record<string, any>

export enum ChallengeType {
  LocalPasscode = 1,
  AccountPassword = 2,
  Biometric = 3
};
/** The source of the challenge */
export enum ChallengeReason {
  ApplicationUnlock = 1,
  ResaveRootKey = 2,
  ProtocolUpgrade = 3,
  Migration = 4
};

export class Challenge {

  public types: ChallengeType[]
  public reason: ChallengeReason
  public id: any

  constructor(
    types: ChallengeType[],
    reason: ChallengeReason
  ) {
    this.types = types;
    this.reason = reason;
    this.id = new Date().getTime();
    Object.freeze(this);
  }
}

export class ChallengeValue {
  public type: ChallengeType
  public value: string | boolean

  constructor(
    type: ChallengeType,
    value: string | boolean
  ) {
    this.type = type;
    this.value = value;
    Object.freeze(this);
  }
}

export class ChallengeResponse {

  public challenge: Challenge
  public values: ChallengeValue[]
  public artifacts?: ChallengeArtifacts

  constructor(
    challenge: Challenge,
    values: ChallengeValue[],
    artifacts?: ChallengeArtifacts
  ) {
    this.challenge = challenge;
    this.values = values;
    this.artifacts = artifacts;
    Object.freeze(this);
  }

  getValueForType(type: ChallengeType) {
    return this.values.find((value) => value.type === type)!;
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
  };
  return mapping[type];
}

export class Challenge {
  constructor(types, reason) {
    this.types = types;
    this.reason = reason;
    this.id = new Date().getTime();
    Object.freeze(this);
  }
}

export class ChallengeValue {
  constructor(type, value) {
    this.type = type;
    this.value = value;
    Object.freeze(this);
  }
}

export class ChallengeResponse {
  /**
   * @param {Challenge} challenge 
   * @param {string|boolean} value 
   * @param {object} validationArtifacts
   */
  constructor(challenge, values, artifacts) {
    this.challenge = challenge;
    this.values = values;
    this.artifacts = artifacts;
    Object.freeze(this);
  }

  getValueForType(type) {
    return this.values.find((value) => value.type === type);
  }
}

export const ChallengeType = {
  LocalPasscode: 1,
  AccountPassword: 2,
  Biometric: 3
};
/** The source of the challenge */
export const ChallengeReason = {
  ApplicationUnlock: 1,
  ResaveRootKey: 2,
  ProtocolUpgrade: 3,
  Migration: 4
};

/**
 * @returns {string} The UI-friendly title for this challenge
 */
export function challengeTypeToString(type) {
  const mapping = {
    [ChallengeType.LocalPasscode]: 'application passcode',
    [ChallengeType.AccountPassword]: 'account password',
    [ChallengeType.Biometric]: 'biometrics',
  };
  return mapping[type];
}

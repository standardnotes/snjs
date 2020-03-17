import { removeFromArray } from '@Lib/utils';

export const Challenges = {
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
export function challengeToString(challenge) {
  const mapping = {
    [Challenges.LocalPasscode]: 'application passcode',
    [Challenges.AccountPassword]: 'account password',
    [Challenges.Biometric]: 'biometrics',
  };
  return mapping[challenge];
}

export class ChallengeResponse {
  /**
   * @param {Challenge} challenge 
   * @param {string|boolean} value 
   */
  constructor(challenge, value) {
    this.challenge = challenge;
    this.value = value;
    Object.freeze(this);
  }
}

export class ChallengeRequest {
  /**
   * @param {Array.<Challenge>} challenges 
   * @param {ChallengeReason} reason 
   */
  constructor(challenges, reason) {
    this.challenges = challenges.slice();
    this.pendingChallenges = challenges.slice();
    this.reason = reason;
    this.responses = [];
  }

  /**
   * @access public
   * Returns an array of challenges that need to be responded to
   */
  getPendingChallenges() {
    return this.pendingChallenges;
  }

  /** 
   * Cancel this request. Orchestrators of this request check to see if it's canceled 
   * before prompting for responses in an infinite while loop
   * @access public
   */
  cancel() {
    this.canceled = true;
  }

  /**
   * @access public
   * @returns {boolean} Whether the request has been canceled by the user
   */
  get isCanceled() {
    return this.canceled;
  }

  /**
   * @access public
   * Adds the response to list of responses, and removes the respective
   * response.challenge from the list of pending challenges.
   */
  addValidResponse(response) {
    this.responses.push(response);
    removeFromArray(this.pendingChallenges, response.challenge);
  }

  /**
   * @access public
   * Returns an array of valid responses, as added to by addValidResponse.
   */
  getResponses() {
    return this.responses;
  }
}
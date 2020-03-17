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
   * @param {object} validationArtifacts
   */
  constructor(challenge, value, validationArtifacts) {
    this.challenge = challenge;
    this.value = value;
    this.validationArtifacts = validationArtifacts;
    Object.freeze(this);
  }
}

export class ChallengeRequest {
  /**
   * @param {Array.<Challenge>} challenges 
   * @param {ChallengeReason} reason 
   * @param {boolean} cancelable - Whether the request is cancelable
   */
  constructor(challenges, reason, cancelable) {
    this.challenges = challenges.slice();
    this.pendingChallenges = challenges.slice();
    this.reason = reason;
    this.cancelable = cancelable;
    this.validResponses = [];
    this.failedResponses = [];
  }

  /**
   * @access public
   * Returns an array of all original challenges for this request
   */
  getAllChallenges() {
    return this.challenges;
  }

  /**
   * @access public
   * Returns an array of challenges that need to be responded to
   */
  getPendingChallenges() {
    return this.pendingChallenges;
  }

  /** 
   * Called by request orchestrator once all responses have completed validation
   * @access public 
   */
  didCompleteValidation() {
    this.onValidationCallback && this.onValidationCallback();
  }

  /**
   * Called by consumers who wish to be informed once validation has completed
   * and when getValidResponses and getFailedResponses returns the most recent values.
   * @access public
   * @param {function} callback 
   */
  onValidation(callback) {
    this.onValidationCallback = callback;
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
    this.validResponses.push(response);
    removeFromArray(this.pendingChallenges, response.challenge);
  }

  /**
   * @access public
   * Adds the response to list of failed responses.
   */
  addFailedResponse(response) {
    if (this.failedResponses.find((r) => r.challenge === response.challenge)) {
      return;
    }
    this.failedResponses.push(response);
  }

  /**
   * @access public
   * Returns an array of valid responses, as added to by addValidResponse.
   */
  getValidResponses() {
    return this.validResponses;
  }

  /**
   * @access public
   * Returns an array of valid responses, as added to by addValidResponse.
   */
  getFailedResponses() {
    return this.failedResponses;
  }
}
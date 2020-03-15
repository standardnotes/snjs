export class ChallengeResponse {
  constructor(challenge, value) {
    this.challenge = challenge;
    this.value = value;
    Object.freeze(this);
  }
}

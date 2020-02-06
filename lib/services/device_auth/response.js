export class DeviceAuthResponse {
  constructor({ challenge, value }) {
    this.challenge = challenge;
    this.value = value;
    Object.freeze(this);
  }
}

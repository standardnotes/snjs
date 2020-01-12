export class DeviceAuthResponse {
  constructor({source, value}) {
    this.source = source;
    this.value = value;
    Object.freeze(this);
  }
}

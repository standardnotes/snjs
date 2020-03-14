export class Session {
  static FromRaw(raw) {
    return new Session(raw.token);
  }

  constructor(token) {
    this.token = token;
  }
}
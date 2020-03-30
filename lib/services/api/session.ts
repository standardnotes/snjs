export class Session {

  public token: string

  static FromRaw(raw: any) {
    return new Session(raw.token);
  }

  constructor(token: string) {
    this.token = token;
  }
}
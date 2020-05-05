export class Session {

  public accessToken: string
  public expireAt?: number
  public refreshToken?: string

  static FromRaw(raw: any) {
    return new Session(raw.accessToken, raw.expireAt, raw.refreshToken);
  }

  constructor(accessToken: string, expireAt?: number, refreshToken?: string) {
    this.accessToken = accessToken;
    this.expireAt = expireAt;
    this.refreshToken = refreshToken;
  }

  private getCurrentTime() {
    return Date.now();
  }

  private getExpireAt(): number {
    return this.expireAt || 0;
  }

  public canExpire() {
    return this.getExpireAt() > 0;
  }

  public isExpired() {
    if (!this.canExpire())
      return false;

    return this.getExpireAt() < this.getCurrentTime();
  }
}

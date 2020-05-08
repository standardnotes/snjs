import { HttpResponse } from "./http_service";

export class Session {

  public accessToken: string
  public expireAt?: number
  public refreshToken?: string

  static FromRaw(raw: any) {
    return new Session(raw.accessToken, raw.expireAt, raw.refreshToken);
  }

  static FromResponse(response: HttpResponse) {
    const accessToken: string = response.token;
    const expireAt: number = response.session?.expire_at;
    const refreshToken: string = response.session?.refresh_token;

    return new Session(accessToken, expireAt, refreshToken);
  }

  constructor(accessToken: string, expireAt?: number, refreshToken?: string) {
    this.accessToken = accessToken;
    this.expireAt = expireAt;
    this.refreshToken = refreshToken;
  }

  private getExpireAt() {
    return this.expireAt || 0;
  }

  public canExpire() {
    return this.getExpireAt() > 0;
  }

  public isExpired() {
    if (!this.canExpire()) {
      return false;
    }
    return this.getExpireAt() < Date.now();
  }
}

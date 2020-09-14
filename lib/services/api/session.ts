import { SessionRenewalResponse } from './responses';

type RawJwtPayload = {
  jwt?: string
}
type RawSessionPayload = {
  accessToken: string
  refreshToken: string
  accessExpiration: number
  refreshExpiration: number
}
type RawStorageValue = RawJwtPayload & RawSessionPayload

export abstract class Session {
  public abstract canExpire(): boolean;

  /** Return the token that should be included in the header of authorized network requests */
  public abstract get authorizationValue(): string;

  static FromRawStorageValue(raw: RawStorageValue) {
    if (raw.jwt) {
      return new JwtSession(
        raw.jwt
      );
    } else {
      return new TokenSession(
        raw.accessToken,
        raw.accessExpiration,
        raw.refreshToken,
        raw.refreshExpiration
      );
    }
  }
}

/** Legacy, for protocol versions <= 003 */
export class JwtSession extends Session {
  public jwt: string;

  constructor(jwt: string) {
    super();
    this.jwt = jwt;
  }

  public get authorizationValue() {
    return this.jwt;
  }

  public canExpire() {
    return false;
  }
}

/** For protocol versions >= 004 */
export class TokenSession extends Session {

  public accessToken: string
  public accessExpiration: number
  public refreshToken: string
  public refreshExpiration: number

  static FromApiResponse(response: SessionRenewalResponse) {
    const accessToken: string = response.session!.access_token;
    const refreshToken: string = response.session!.refresh_token;
    const accessExpiration: number = response.session!.access_expiration;
    const refreshExpiration: number = response.session!.refresh_expiration;
    return new TokenSession(accessToken, accessExpiration, refreshToken, refreshExpiration);
  }

  constructor(
    accessToken: string,
    accessExpiration: number,
    refreshToken: string,
    refreshExpiration: number
  ) {
    super();
    this.accessToken = accessToken;
    this.accessExpiration = accessExpiration;
    this.refreshToken = refreshToken;
    this.refreshExpiration = refreshExpiration;
  }

  private getExpireAt() {
    return this.accessExpiration || 0;
  }

  public get authorizationValue() {
    return this.accessToken;
  }

  public canExpire() {
    return true;
  }

  public isExpired() {
    return this.getExpireAt() < Date.now();
  }
}

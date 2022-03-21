import { SessionRenewalResponse } from '@standardnotes/responses'
import { Uuid } from '@standardnotes/common'

type RawJwtPayload = {
  jwt?: string
}
type RawSessionPayload = {
  accessToken: string
  refreshToken: string
  accessExpiration: number
  refreshExpiration: number
  readonlyAccess: boolean
}
type RawStorageValue = RawJwtPayload | RawSessionPayload

export type RemoteSession = {
  uuid: Uuid
  updated_at: Date
  device_info: string
  current: boolean
}

export abstract class Session {
  public abstract canExpire(): boolean

  /** Return the token that should be included in the header of authorized network requests */
  public abstract get authorizationValue(): string

  static FromRawStorageValue(raw: RawStorageValue): JwtSession | TokenSession {
    if ((raw as RawJwtPayload).jwt) {
      return new JwtSession((raw as RawJwtPayload).jwt!)
    } else {
      const rawSession = raw as RawSessionPayload
      return new TokenSession(
        rawSession.accessToken,
        rawSession.accessExpiration,
        rawSession.refreshToken,
        rawSession.refreshExpiration,
        rawSession.readonlyAccess,
      )
    }
  }
}

/** Legacy, for protocol versions <= 003 */
export class JwtSession extends Session {
  public jwt: string

  constructor(jwt: string) {
    super()
    this.jwt = jwt
  }

  public get authorizationValue(): string {
    return this.jwt
  }

  public canExpire(): false {
    return false
  }
}

/** For protocol versions >= 004 */
export class TokenSession extends Session {
  static FromApiResponse(response: SessionRenewalResponse) {
    const accessToken: string = response.data.session!.access_token
    const refreshToken: string = response.data.session!.refresh_token
    const accessExpiration: number = response.data.session!.access_expiration
    const refreshExpiration: number = response.data.session!.refresh_expiration
    const readonlyAccess: boolean = response.data.session!.readonly_access

    return new TokenSession(
      accessToken,
      accessExpiration,
      refreshToken,
      refreshExpiration,
      readonlyAccess
    )
  }

  constructor(
    public accessToken: string,
    public accessExpiration: number,
    public refreshToken: string,
    public refreshExpiration: number,
    private readonlyAccess: boolean,
  ) {
    super()
  }

  isReadOnly() {
    return this.readonlyAccess
  }

  private getExpireAt() {
    return this.accessExpiration || 0
  }

  public get authorizationValue() {
    return this.accessToken
  }

  public canExpire() {
    return true
  }

  public isExpired() {
    return this.getExpireAt() < Date.now()
  }
}

import { SessionRenewalResponse } from './responses';
export declare abstract class Session {
    abstract canExpire(): boolean;
    /** Return the token that should be included in the header of authorized network requests */
    abstract get authorizationValue(): string;
    static FromRawStorageValue(raw: any): JwtSession | TokenSession;
}
/** Legacy, for protocol versions <= 003 */
export declare class JwtSession extends Session {
    jwt: string;
    constructor(jwt: string);
    get authorizationValue(): string;
    canExpire(): boolean;
}
/** For protocol versions >= 004 */
export declare class TokenSession extends Session {
    accessToken: string;
    accessExpiration: number;
    refreshToken: string;
    refreshExpiration: number;
    static FromApiResponse(response: SessionRenewalResponse): TokenSession;
    constructor(accessToken: string, accessExpiration: number, refreshToken: string, refreshExpiration: number);
    private getExpireAt;
    get authorizationValue(): string;
    canExpire(): boolean;
    isExpired(): boolean;
}

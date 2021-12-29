import { SessionRenewalResponse } from './responses';
import { UuidString } from '../../types';
declare type RawJwtPayload = {
    jwt?: string;
};
declare type RawSessionPayload = {
    accessToken: string;
    refreshToken: string;
    accessExpiration: number;
    refreshExpiration: number;
};
declare type RawStorageValue = RawJwtPayload | RawSessionPayload;
export declare type RemoteSession = {
    uuid: UuidString;
    updated_at: Date;
    device_info: string;
    current: boolean;
};
export declare abstract class Session {
    abstract canExpire(): boolean;
    /** Return the token that should be included in the header of authorized network requests */
    abstract get authorizationValue(): string;
    static FromRawStorageValue(raw: RawStorageValue): JwtSession | TokenSession;
}
/** Legacy, for protocol versions <= 003 */
export declare class JwtSession extends Session {
    jwt: string;
    constructor(jwt: string);
    get authorizationValue(): string;
    canExpire(): false;
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
export {};

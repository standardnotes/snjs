export declare class Session {
    accessToken: string;
    expireAt?: number;
    refreshToken?: string;
    static FromRaw(raw: any): Session;
    constructor(accessToken: string, expireAt?: number, refreshToken?: string);
    private getCurrentTime;
    private getExpireAt;
    canExpire(): boolean;
    isExpired(): boolean;
}

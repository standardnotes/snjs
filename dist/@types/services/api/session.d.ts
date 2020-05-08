import { HttpResponse } from "./http_service";
export declare class Session {
    accessToken: string;
    expireAt?: number;
    refreshToken?: string;
    static FromRaw(raw: any): Session;
    static FromResponse(response: HttpResponse): Session;
    constructor(accessToken: string, expireAt?: number, refreshToken?: string);
    private getExpireAt;
    canExpire(): boolean;
    isExpired(): boolean;
}

import { ProtocolVersion } from './../../protocol/versions';
import { HttpResponse } from './http_service';
declare type SessionBody = {
    access_token: string;
    refresh_token: string;
    access_expiration: number;
    refresh_expiration: number;
};
export declare type KeyParamsResponse = HttpResponse & {
    identifier?: string;
    pw_cost?: number;
    pw_nonce?: string;
    version?: ProtocolVersion;
    /** Legacy V002 */
    pw_salt?: string;
    /** Legacy V001 */
    pw_func?: string;
    pw_alg?: string;
    pw_key_size?: number;
};
export declare type RegistrationResponse = HttpResponse & {
    session?: SessionBody;
    /** Represents legacy JWT token */
    token?: string;
    user?: {
        email: string;
        uuid: string;
    };
};
export declare type SignInResponse = RegistrationResponse;
export declare type ChangePasswordResponse = RegistrationResponse;
export declare type SignOutResponse = HttpResponse & {};
export declare type SessionRenewalResponse = HttpResponse & {
    session?: SessionBody;
};
export {};

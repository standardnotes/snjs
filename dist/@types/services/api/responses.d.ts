import { RawPayload } from '../../protocol/payloads/generator';
import { ApiEndpointParam } from './keys';
import { KeyParamsOrigination, AnyKeyParamsContent } from './../../protocol/key_params';
import { ProtocolVersion } from './../../protocol/versions';
export declare enum StatusCode {
    HttpStatusMinSuccess = 200,
    HttpStatusMaxSuccess = 299,
    /** The session's access token is expired, but the refresh token is valid */
    HttpStatusExpiredAccessToken = 498,
    /** The session's access token and refresh token are expired, user must reauthenticate */
    HttpStatusInvalidSession = 401,
    LocalValidationError = 10,
    CanceledMfa = 11
}
export declare type HttpResponse = {
    status: StatusCode;
    error?: {
        message: string;
        status: number;
        tag?: string;
        /** In the case of MFA required responses,
         * the required prompt is returned as part of the error */
        payload?: {
            mfa_key?: string;
        };
    };
    object?: any;
};
export declare function isErrorResponseExpiredToken(errorResponse: HttpResponse): boolean;
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
    origination?: KeyParamsOrigination;
    created?: string;
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
export declare type SignInResponse = RegistrationResponse & {
    key_params?: AnyKeyParamsContent;
};
export declare type ChangePasswordResponse = SignInResponse;
export declare type SignOutResponse = HttpResponse & {};
export declare type SessionRenewalResponse = HttpResponse & {
    session?: SessionBody;
};
export declare type SessionListEntry = {
    uuid: string;
    api_version: string;
    created_at: string;
    updated_at: string;
    device_info: string;
};
export declare type SessionListResponse = HttpResponse & SessionListEntry[];
export declare type RevisionListEntry = {
    content_type: string;
    created_at: string;
    updated_at: string;
    /** The uuid of the revision */
    uuid: string;
};
export declare type RevisionListResponse = HttpResponse & RevisionListEntry[];
export declare type SingleRevision = {
    auth_hash?: string;
    content_type: string;
    content: string;
    created_at: string;
    enc_item_key: string;
    /** The uuid of the item this revision was created with */
    item_uuid: string;
    items_key_id: string;
    updated_at: string;
    /** The uuid of the revision */
    uuid: string;
};
export declare type SingleRevisionResponse = HttpResponse & Partial<SingleRevision>;
export declare enum ConflictType {
    ConflictingData = "sync_conflict",
    UuidConflict = "uuid_conflict"
}
export declare type ConflictParams = {
    type: ConflictType;
    server_item?: RawPayload;
    unsaved_item?: RawPayload;
    /** @legacay */
    item?: RawPayload;
};
export declare type RawSyncResponse = {
    error?: any;
    [ApiEndpointParam.LastSyncToken]?: string;
    [ApiEndpointParam.PaginationToken]?: string;
    [ApiEndpointParam.IntegrityResult]?: string;
    retrieved_items?: RawPayload[];
    saved_items?: RawPayload[];
    conflicts?: ConflictParams[];
    unsaved?: ConflictParams[];
    status?: number;
};
export {};

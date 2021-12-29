import { RawPayload } from '../../../../protocol/payloads/generator';
import { ApiEndpointParam } from './keys';
import { AnyKeyParamsContent, KeyParamsOrigination } from './../../protocol/key_params';
import { ProtocolVersion } from './../../protocol/versions';
import { Role, Subscription, SubscriptionName } from '@standardnotes/auth';
import { FeatureDescription } from '@standardnotes/features';
import { UuidString } from '../../../../types';
export declare enum StatusCode {
    LocalValidationError = 10,
    CanceledMfa = 11,
    UnknownError = 12,
    HttpStatusMinSuccess = 200,
    HttpStatusNoContent = 204,
    HttpStatusMaxSuccess = 299,
    /** The session's access token is expired, but the refresh token is valid */
    HttpStatusExpiredAccessToken = 498,
    /** The session's access token and refresh token are expired, user must reauthenticate */
    HttpStatusInvalidSession = 401,
    /** User's IP is rate-limited. */
    HttpStatusForbidden = 403,
    HttpBadRequest = 400
}
declare type Error = {
    message: string;
    status: number;
    tag?: string;
    /** In the case of MFA required responses,
     * the required prompt is returned as part of the error */
    payload?: {
        mfa_key?: string;
    };
};
export declare type HttpResponse = {
    status?: StatusCode;
    error?: Error;
    data?: {
        error?: Error;
    };
    meta?: ResponseMeta;
};
export declare type ResponseMeta = {
    auth: {
        userUuid?: UuidString;
        roles?: Role[];
    };
};
export declare function isErrorResponseExpiredToken(errorResponse: HttpResponse): boolean;
declare type SessionBody = {
    access_token: string;
    refresh_token: string;
    access_expiration: number;
    refresh_expiration: number;
};
export declare type KeyParamsData = {
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
export declare type KeyParamsResponse = HttpResponse & {
    data: KeyParamsData;
};
export declare type User = {
    uuid: string;
    email: string;
};
export declare type RegistrationData = {
    session?: SessionBody;
    /** Represents legacy JWT token */
    token?: string;
    user?: User;
};
export declare type RegistrationResponse = HttpResponse & {
    data: RegistrationData;
};
export declare type SignInData = {
    session?: SessionBody;
    /** Represents legacy JWT token */
    token?: string;
    user?: User;
    key_params?: AnyKeyParamsContent;
};
export declare type SignInResponse = HttpResponse & {
    data: SignInData;
};
export declare type ChangeCredentialsData = {
    session?: SessionBody;
    /** Represents legacy JWT token */
    token?: string;
    user?: User;
    key_params?: AnyKeyParamsContent;
};
export declare type ChangeCredentialsResponse = HttpResponse & {
    data: ChangeCredentialsData;
};
export declare type SignOutResponse = HttpResponse & Record<string, unknown>;
export declare type SessionRenewalData = {
    session?: SessionBody;
};
export declare type SessionRenewalResponse = HttpResponse & {
    data: SessionRenewalData;
};
export declare type SessionListEntry = {
    uuid: string;
    current: boolean;
    api_version: string;
    created_at: string;
    updated_at: string;
    device_info: string;
};
export declare type SessionListResponse = HttpResponse & {
    data: SessionListEntry[];
};
export declare type RevisionListEntry = {
    content_type: string;
    created_at: string;
    updated_at: string;
    /** The uuid of the revision */
    uuid: string;
};
export declare type RevisionListResponse = HttpResponse & {
    data: RevisionListEntry[];
};
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
export declare type SingleRevisionResponse = HttpResponse & {
    data: Partial<SingleRevision>;
};
export declare enum ConflictType {
    ConflictingData = "sync_conflict",
    UuidConflict = "uuid_conflict",
    ContentTypeError = "content_type_error",
    ContentError = "content_error"
}
export declare type ConflictParams = {
    type: ConflictType;
    server_item?: RawPayload;
    unsaved_item?: RawPayload;
    /** @legacay */
    item?: RawPayload;
};
export declare type RawSyncData = {
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
export declare type RawSyncResponse = HttpResponse & {
    data: RawSyncData;
};
export declare type UserFeaturesData = {
    features: FeatureDescription[];
};
export declare type UserFeaturesResponse = HttpResponse & {
    data: UserFeaturesData;
};
declare type SettingData = {
    uuid: string;
    name: string;
    value: string;
    sensitive?: boolean;
};
export declare type MinimalHttpResponse = {
    status?: StatusCode;
    error?: Error;
};
export declare type ListSettingsResponse = MinimalHttpResponse & {
    data?: {
        settings?: SettingData[];
    };
};
export declare type GetSettingResponse = MinimalHttpResponse & {
    data?: {
        success?: boolean;
        setting?: SettingData;
    };
};
export declare type UpdateSettingResponse = MinimalHttpResponse;
export declare type DeleteSettingResponse = MinimalHttpResponse;
export declare type GetSubscriptionResponse = MinimalHttpResponse & {
    data?: {
        subscription?: Subscription;
    };
};
export declare type AvailableSubscriptions = {
    [key in SubscriptionName]: {
        name: string;
        pricing: {
            price: number;
            period: string;
        }[];
        features: FeatureDescription[];
    };
};
export declare type GetAvailableSubscriptionsResponse = MinimalHttpResponse & {
    data?: AvailableSubscriptions;
};
export declare type PostSubscriptionTokensResponse = MinimalHttpResponse & {
    data?: {
        token: string;
    };
};
export declare type GetOfflineFeaturesResponse = MinimalHttpResponse & {
    data?: {
        features: FeatureDescription[];
    };
};
export {};

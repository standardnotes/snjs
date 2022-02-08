import { RawPayload } from '@Payloads/generator';
import { ApiEndpointParam } from './keys';
import {
  AnyKeyParamsContent,
  KeyParamsOrigination,
} from './../../protocol/key_params';
import { ProtocolVersion } from './../../protocol/versions';
import { Role, Subscription } from '@standardnotes/auth';
import { RoleName, SubscriptionName } from '@standardnotes/common';
import { FeatureDescription } from '@standardnotes/features';
import { UuidString } from '@Lib/types';

export enum StatusCode {
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
  HttpBadRequest = 400,
}

type Error = {
  message: string;
  status: number;
  tag?: string;
  /** In the case of MFA required responses,
   * the required prompt is returned as part of the error */
  payload?: {
    mfa_key?: string;
  };
};

export type HttpResponse = {
  status?: StatusCode;
  error?: Error;
  data?: {
    error?: Error;
  };
  meta?: ResponseMeta;
};

export type ResponseMeta = {
  auth: {
    userUuid?: UuidString;
    roles?: Role[];
  };
};

export function isErrorResponseExpiredToken(errorResponse: HttpResponse) {
  return errorResponse.status === StatusCode.HttpStatusExpiredAccessToken;
}

type SessionBody = {
  access_token: string;
  refresh_token: string;
  access_expiration: number;
  refresh_expiration: number;
};

export type KeyParamsData = {
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

export type KeyParamsResponse = HttpResponse & {
  data: KeyParamsData;
};

export type User = {
  uuid: string;
  email: string;
};

export type RegistrationData = {
  session?: SessionBody;
  /** Represents legacy JWT token */
  token?: string;
  user?: User;
};

export type RegistrationResponse = HttpResponse & {
  data: RegistrationData;
};

export type SignInData = {
  session?: SessionBody;
  /** Represents legacy JWT token */
  token?: string;
  user?: User;
  key_params?: AnyKeyParamsContent;
};

export type SignInResponse = HttpResponse & {
  data: SignInData;
};

export type ChangeCredentialsData = {
  session?: SessionBody;
  /** Represents legacy JWT token */
  token?: string;
  user?: User;
  key_params?: AnyKeyParamsContent;
};

export type ChangeCredentialsResponse = HttpResponse & {
  data: ChangeCredentialsData;
};

export type SignOutResponse = HttpResponse & Record<string, unknown>;

export type SessionRenewalData = {
  session?: SessionBody;
};

export type SessionRenewalResponse = HttpResponse & {
  data: SessionRenewalData;
};

export type SessionListEntry = {
  uuid: string;
  current: boolean;
  api_version: string;
  created_at: string;
  updated_at: string;
  device_info: string;
};

export type SessionListResponse = HttpResponse & { data: SessionListEntry[] };

export type RevisionListEntry = {
  content_type: string;
  created_at: string;
  updated_at: string;
  /** The uuid of the revision */
  uuid: string;
  required_role: RoleName;
};

export type RevisionListResponse = HttpResponse & { data: RevisionListEntry[] };

export type SingleRevision = {
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

export type SingleRevisionResponse = HttpResponse & {
  data: Partial<SingleRevision>;
};

export enum ConflictType {
  ConflictingData = 'sync_conflict',
  UuidConflict = 'uuid_conflict',
  ContentTypeError = 'content_type_error',
  ContentError = 'content_error',
}

export type ConflictParams = {
  type: ConflictType;
  server_item?: RawPayload;
  unsaved_item?: RawPayload;
  /** @legacay */
  item?: RawPayload;
};

export type RawSyncData = {
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

export type RawSyncResponse = HttpResponse & { data: RawSyncData };

export type UserFeaturesData = {
  features: FeatureDescription[];
};

export type UserFeaturesResponse = HttpResponse & {
  data: UserFeaturesData;
};

type SettingData = {
  uuid: string;
  name: string;
  value: string;
  sensitive?: boolean;
};

export type MinimalHttpResponse = {
  status?: StatusCode;
  error?: Error;
};

export type ListSettingsResponse = MinimalHttpResponse & {
  data?: {
    settings?: SettingData[];
  };
};
export type GetSettingResponse = MinimalHttpResponse & {
  data?: {
    success?: boolean;
    setting?: SettingData;
  };
};
export type UpdateSettingResponse = MinimalHttpResponse;
export type DeleteSettingResponse = MinimalHttpResponse;

export type GetSubscriptionResponse = MinimalHttpResponse & {
  data?: {
    subscription?: Subscription;
  };
};

export type CreateValetTokenResponse = MinimalHttpResponse & {
  data?: {
    success: true
    valetToken: string
  } | {
    success: false
    reason: 'no-subscription' | 'expired-subscription'
  }
}

export type AvailableSubscriptions = {
  [key in SubscriptionName]: {
    name: string;
    pricing: {
      price: number;
      period: string;
    }[];
    features: FeatureDescription[];
  };
};

export type GetAvailableSubscriptionsResponse = MinimalHttpResponse & {
  data?: AvailableSubscriptions;
};

export type PostSubscriptionTokensResponse = MinimalHttpResponse & {
  data?: {
    token: string;
  };
};

export type GetOfflineFeaturesResponse = MinimalHttpResponse & {
  data?: {
    features: FeatureDescription[];
  };
};

export type ListedRegistrationResponse = MinimalHttpResponse & {
  data?: unknown;
};

export type ListedAccount = {
  secret: string;
  authorId: string;
  hostUrl: string;
};

export type ListedAccountInfo = ActionResponse & {
  display_name: string;
  author_url: string;
  settings_url: string;
};

export type ListedAccountInfoResponse = HttpResponse & {
  data: ListedAccountInfo;
};

export type ActionResponse = HttpResponse & {
  description: string;
  supported_types: string[];
  deprecation?: string;
  actions: any[];
  item?: any;
  keyParams?: any;
  auth_params?: any;
};

export type StartUploadSessionResponse = MinimalHttpResponse & {
  success: boolean;
  uploadId: string;
};

export type UploadFileChunkResponse = MinimalHttpResponse & {
  success: boolean;
};

export type CloseUploadSessionResponse = MinimalHttpResponse & {
  success: boolean;
  message: string;
};

export type DownloadFileChunkResponse = MinimalHttpResponse & {
};

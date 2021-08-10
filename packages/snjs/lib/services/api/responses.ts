import { RawPayload } from '@Payloads/generator';
import { ApiEndpointParam } from './keys';
import {
  AnyKeyParamsContent,
  KeyParamsOrigination,
} from './../../protocol/key_params';
import { ProtocolVersion } from './../../protocol/versions';
import { Role } from '@standardnotes/auth';
import { Feature } from '@standardnotes/features';

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
    roles?: Role[];
    features?: Feature[];
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

export type ChangePasswordData = {
  session?: SessionBody;
  /** Represents legacy JWT token */
  token?: string;
  user?: User;
  key_params?: AnyKeyParamsContent;
};

export type ChangePasswordResponse = HttpResponse & {
  data: ChangePasswordData;
};

export type SignOutResponse = HttpResponse & Record<string, unknown>;

export type SessionRenewalData = {
  session?: SessionBody;
}

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

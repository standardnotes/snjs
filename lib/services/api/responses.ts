import { RawPayload } from '@Payloads/generator';
import { ApiEndpointParam } from './keys';
import { KeyParamsOrigination, AnyKeyParamsContent } from './../../protocol/key_params';
import { ProtocolVersion } from './../../protocol/versions';

export enum HttpStatusCode {
  HttpStatusMinSuccess = 200,
  HttpStatusMaxSuccess = 299,
  /** The session's access token is expired, but the refresh token is valid */
  HttpStatusExpiredAccessToken = 498,
  /** The session's access token and refresh token are expired, user must reauthenticate */
  HttpStatusInvalidSession = 401,
}

export type HttpResponse = {
  status: HttpStatusCode,
  error?: {
    message: string,
    status: number,
    tag?: string,
    /** In the case of MFA required responses,
     * the required prompt is returned as part of the error */
    payload?: {
      mfa_key?: string
    }
  }
  object?: any
}

export function isErrorResponseExpiredToken(errorResponse: HttpResponse) {
  return errorResponse.status === HttpStatusCode.HttpStatusExpiredAccessToken;
}

type SessionBody = {
  access_token: string
  refresh_token: string
  access_expiration: number
  refresh_expiration: number
}


export type KeyParamsResponse = HttpResponse & {
  identifier?: string
  pw_cost?: number
  pw_nonce?: string
  version?: ProtocolVersion
  /** Legacy V002 */
  pw_salt?: string
  /** Legacy V001 */
  pw_func?: string
  pw_alg?: string
  pw_key_size?: number,
  origination?: KeyParamsOrigination,
  created?: string,
}

export type RegistrationResponse = HttpResponse & {
  session?: SessionBody
  /** Represents legacy JWT token */
  token?: string,
  user?: { email: string, uuid: string },
}

export type SignInResponse = RegistrationResponse & {
  key_params?: AnyKeyParamsContent
}

export type ChangePasswordResponse = SignInResponse;

export type SignOutResponse = HttpResponse & {

}

export type SessionRenewalResponse = HttpResponse & {
  session?: SessionBody
}

export enum ConflictType {
  ConflictingData = 'sync_conflict',
  UuidConflict = 'uuid_conflict'
}

export type ConflictParams = {
  type: ConflictType
  server_item?: RawPayload
  unsaved_item?: RawPayload
  /** @legacay */
  item?: RawPayload
}

export type RawSyncResponse = {
  error?: any
  [ApiEndpointParam.LastSyncToken]?: string
  [ApiEndpointParam.PaginationToken]?: string
  [ApiEndpointParam.IntegrityResult]?: string
  retrieved_items?: RawPayload[]
  saved_items?: RawPayload[]
  conflicts?: ConflictParams[]
  unsaved?: ConflictParams[]
  status?: number
}
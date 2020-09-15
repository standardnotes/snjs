import { ProtocolVersion } from './../../protocol/versions';
import { HttpResponse } from './http_service';

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
  pw_key_size?: number
}

export type RegistrationResponse = HttpResponse & {
  session?: SessionBody
  /** Represents legacy JWT token */
  token?: string,
  user?: { email: string, uuid: string },
}

export type SignInResponse = RegistrationResponse;

export type ChangePasswordResponse = RegistrationResponse;

export type SignOutResponse = HttpResponse & {

}

export type SessionRenewalResponse = HttpResponse & {
  session?: SessionBody
}
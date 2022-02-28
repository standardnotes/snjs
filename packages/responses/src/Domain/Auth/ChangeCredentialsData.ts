import { AnyKeyParamsContent } from '@standardnotes/common'
import { SessionBody } from './SessionBody'
import { User } from './User'

export type ChangeCredentialsData = {
  session?: SessionBody
  /** Represents legacy JWT token */
  token?: string
  user?: User
  key_params?: AnyKeyParamsContent
}

import { RoleName } from '@standardnotes/common'

export interface UserSignedInEventPayload {
  userUuid: string
  userEmail: string
  userRoles: RoleName[]
  signInAlertEnabled: boolean,
  device: string
  browser: string
}

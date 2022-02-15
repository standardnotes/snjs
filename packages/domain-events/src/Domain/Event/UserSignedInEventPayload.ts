import { RoleName } from '@standardnotes/common'

export interface UserSignedInEventPayload {
  userUuid: string
  userEmail: string
  userRoles: RoleName[]
  device: string
  browser: string
}

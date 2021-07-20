import { RoleName } from '@standardnotes/auth'

export interface UserRoleChangedEventPayload {
  userUuid: string
  email: string
  fromRole: RoleName
  toRole: RoleName
  timestamp: number
}

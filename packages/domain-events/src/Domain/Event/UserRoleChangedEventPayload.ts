import { RoleName } from '@standardnotes/auth'

export interface UserRoleChangedEventPayload {
  userUuid: string
  email: string
  toRole: RoleName
  timestamp: number
}

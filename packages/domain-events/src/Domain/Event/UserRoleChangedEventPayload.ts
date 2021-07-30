import { RoleName } from '@standardnotes/auth'

export interface UserRoleChangedEventPayload {
  userUuid: string
  email: string
  role: RoleName
  timestamp: number
}

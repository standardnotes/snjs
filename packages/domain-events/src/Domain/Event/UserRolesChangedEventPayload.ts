import { Role } from '@standardnotes/auth'

export interface UserRolesChangedEventPayload {
  userUuid: string
  email: string
  roles: Role[]
  timestamp: number
}

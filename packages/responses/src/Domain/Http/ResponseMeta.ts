import { Role } from '@standardnotes/auth'
import { Uuid } from '@standardnotes/common'

export type ResponseMeta = {
  auth: {
    userUuid?: Uuid
    roles?: Role[]
  },
  server: {
    filesServerUrl?: string
  }
}

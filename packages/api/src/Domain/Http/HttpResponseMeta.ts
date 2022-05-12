import { Role } from '@standardnotes/auth'
import { Uuid } from '@standardnotes/common'

export type HttpResponseMeta = {
  auth: {
    userUuid?: Uuid
    roles?: Role[]
  }
  server: {
    filesServerUrl?: string
  }
}

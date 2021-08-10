import { Uuid } from '@standardnotes/common'

import { Role } from '../Role/Role'

export type Token = {
  user: {
    uuid: Uuid,
    email: string
  },
  roles: Array<Role>,
  session?: {
    uuid: Uuid,
    api_version: string,
    created_at: string,
    updated_at: string,
    device_info: string
  },
  extensionKey?: string,
}

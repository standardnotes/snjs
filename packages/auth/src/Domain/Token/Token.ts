import { Uuid } from '@standardnotes/common'
import { FeatureIdentifier } from '@standardnotes/features'

import { Role } from '../Role/Role'

export type Token = {
  user: {
    uuid: Uuid,
    email: string
  },
  roles: Array<Role>,
  features: Array<FeatureIdentifier>,
  session?: {
    uuid: Uuid,
    api_version: string,
    created_at: string,
    updated_at: string,
    device_info: string
  },
  extensionKey?: string,
}

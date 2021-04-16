import { Uuid } from "../Uuid/Uuid";

export type Token = {
  user: {
    uuid: Uuid,
    email: string
  },
  session: {
    uuid: Uuid,
    api_version: string,
    created_at: string,
    updated_at: string,
    device_info: string
  },
  roles: Array<{
    uuid: Uuid
    name: string
  }>,
  permissions: Array<{
    uuid: Uuid
    name: string
  }>,
}

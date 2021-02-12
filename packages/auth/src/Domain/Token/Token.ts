export type Token = {
  user: {
    uuid: string,
    email: string
  },
  session: {
    uuid: string,
    api_version: string,
    created_at: string,
    updated_at: string,
    device_info: string
  },
  roles: Array<{
    uuid: string
    name: string
  }>,
  permissions: Array<{
    uuid: string
    name: string
  }>,
}
  
import { Uuid } from '../Uuid/Uuid'
import { PermissionName } from './PermissionName'

export type Permission = {
  uuid: Uuid;
  name: PermissionName;
}

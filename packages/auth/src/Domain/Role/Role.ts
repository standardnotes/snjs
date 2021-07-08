import { Uuid } from "../Uuid/Uuid";

export enum RoleName {
  User = 'USER',
  CoreUser = 'CORE_USER',
  PlusUser = 'PLUS_USER',
  ProUser = 'PRO_USER'
}

export type Role = {
  uuid: Uuid;
  name: RoleName;
}

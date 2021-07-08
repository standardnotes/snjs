import { Uuid } from '../Uuid/Uuid'

export enum PermissionName {
  SyncItems = 'SYNC_ITEMS',
  ExtendedNoteHistory = 'EXTENDED_NOTE_HISTORY',
  UnlimitedNoteHistory = 'UNLIMITED_NOTE_HISTORY'
}

export type Permission = {
  uuid: Uuid;
  name: PermissionName;
}

export type AnyRecord = Partial<Record<string, any>>;
export type UuidString = string;
export type ApplicationIdentifier = string;

export enum DeinitSource {
  SignOut = 1,
  Lock = 2,
  AppGroupUnload = 3,
}

export type ErrorObject = {
  error: string;
}

export type ApplicationEventPayload = Partial<{
}>

export type IconType = 'menu-arrow-down-alt'
  | 'menu-arrow-right'
  | 'notes'
  | 'arrows-sort-up'
  | 'arrows-sort-down'
  | 'lock'
  | 'lock-filled'
  | 'eye'
  | 'eye-off'
  | 'server'
  | 'email'
  | 'chevron-down'
  | 'arrow-left'
  | 'sync'
  | 'check-circle'
  | 'signIn'
  | 'signOut'
  | 'cloud-off'
  | 'pencil-off'
  | 'plain-text'
  | 'rich-text'
  | 'code'
  | 'markdown'
  | 'authenticator'
  | 'spreadsheets'
  | 'tasks'
  | 'trash'
  | 'trash-filled'
  | 'pin'
  | 'pin-filled'
  | 'unpin'
  | 'archive'
  | 'unarchive'
  | 'hashtag'
  | 'chevron-right'
  | 'restore'
  | 'close'
  | 'password'
  | 'trash-sweep'
  | 'more'
  | 'tune'
  | 'accessibility'
  | 'add'
  | 'help'
  | 'keyboard'
  | 'list-bulleted'
  | 'link-off'
  | 'listed'
  | 'security'
  | 'settings'
  | 'star'
  | 'themes'
  | 'user'
  | 'copy'
  | 'download'
  | 'info'
  | 'check'
  | 'check-bold'
  | 'account-circle'
  | 'menu-arrow-down'
  | 'menu-close'
  | 'window'
  | 'premium-feature';
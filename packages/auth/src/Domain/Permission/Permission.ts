import { Uuid } from '../Uuid/Uuid'

export enum PermissionName {
  MidnightTheme = 'theme:midnight',
  FuturaTheme = 'theme:futura',
  SolarizedDarkTheme = 'theme:solarized-dark',
  AutobiographyTheme = 'theme:autobiography',
  FocusedTheme = 'theme:focused',
  TitaniumTheme = 'theme:titanium',
  BoldEditor = 'editor:bold',
  PlusEditor = 'editor:plus',
  MarkdownBasicEditor = 'editor:markdown-basic',
  MarkdownProEditor = 'editor:markdown-pro',
  MarkdownMinimistEditor = 'editor:markdown-minimist',
  TaskEditor = 'editor:task-editor',
  CodeEditor = 'editor:code-editor',
  TokenVaultEditor = 'editor:token-vault',
  SheetsEditor = 'editor:sheets',
  TwoFactorAuth = 'server:two-factor-auth',
  NoteHistoryUnlimited = 'server:note-history-unlimited',
  NoteHistory365Days = 'server:note-history-365-days',
  NoteHistory30Days = 'server:note-history-30-days',
  DailyEmailBackup = 'server:daily-email-backup',
  DailyDropboxBackup = 'server:daily-dropbox-backup',
  DailyGDriveBackup = 'server:daily-gdrive-backup',
  DailyOneDriveBackup = 'server:daily-onedrive-backup',
  Files25GB = 'server:files-25-gb',
  Files5GB = 'server:files-5-gb',
  TagNesting = 'app:tag-nesting',
  Files = 'app:files',
  CloudLink = 'component:cloud-link',
  TwoFactorAuthManager = 'component:2fa-manager',
  ListedCustomDomain = 'listed:custom-domain',
}

export type Permission = {
  uuid: Uuid;
  name: PermissionName;
}

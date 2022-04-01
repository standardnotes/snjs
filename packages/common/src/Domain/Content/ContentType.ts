/* istanbul ignore file */
export enum ContentType {
  Any = '*',
  Item = 'SF|Item',
  RootKey = 'SN|RootKey|NoSync',
  ItemsKey = 'SN|ItemsKey',
  EncryptedStorage = 'SN|EncryptedStorage',
  Privileges = 'SN|Privileges',
  Note = 'Note',
  Tag = 'Tag',
  SmartView = 'SN|SmartTag',
  Component = 'SN|Component',
  Editor = 'SN|Editor',
  ActionsExtension = 'Extension',
  UserPrefs = 'SN|UserPreferences',
  HistorySession = 'SN|HistorySession',
  Theme = 'SN|Theme',
  File = 'SN|File',
  FilesafeCredentials = 'SN|FileSafe|Credentials',
  FilesafeFileMetadata = 'SN|FileSafe|FileMetadata',
  FilesafeIntegration = 'SN|FileSafe|Integration',
  ExtensionRepo = 'SN|ExtensionRepo',
  Unknown = 'Unknown',
}

export function DisplayStringForContentType(contentType: ContentType): string | undefined {
  const map: Partial<Record<ContentType, string>> = {
    [ContentType.Note]: 'note',
    [ContentType.Tag]: 'tag',
    [ContentType.SmartView]: 'smart view',
    [ContentType.ActionsExtension]: 'action-based extension',
    [ContentType.Component]: 'component',
    [ContentType.Editor]: 'editor',
    [ContentType.Theme]: 'theme',
    [ContentType.FilesafeCredentials]: 'FileSafe credential',
    [ContentType.FilesafeFileMetadata]: 'FileSafe file',
    [ContentType.FilesafeIntegration]: 'FileSafe integration',
  }

  return map[contentType]
}

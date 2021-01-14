export const DefaultAppDomain = 'org.standardnotes.sn';

export enum ContentType {
  Any = '*',
  Item = 'SF|Item',
  RootKey = 'SN|RootKey|NoSync',
  ItemsKey = 'SN|ItemsKey',
  EncryptedStorage = 'SN|EncryptedStorage',
  Note = 'Note',
  Tag = 'Tag',
  SmartTag = 'SN|SmartTag',
  Component = 'SN|Component',
  Editor = 'SN|Editor',
  ActionsExtension = 'Extension',
  UserPrefs = 'SN|UserPreferences',
  /**
   * @deprecated Privileges are now inferred based on the user's active
   * protections, like passcode or biometrics
   */
  Privileges = 'SN|Privileges',
  HistorySession = 'SN|HistorySession',
  Theme = 'SN|Theme',
  Mfa = 'SF|MFA',
  ServerExtension = 'SF|Extension',
  FilesafeCredentials = 'SN|FileSafe|Credentials',
  FilesafeFileMetadata = 'SN|FileSafe|FileMetadata',
  FilesafeIntegration = 'SN|FileSafe|Integration',
  ExtensionRepo = 'SN|ExtensionRepo',
}

export function displayStringForContentType(
  contentType: ContentType
): string | undefined {
  const map: Record<string, string> = {
    [ContentType.Note]: 'note',
    [ContentType.Tag]: 'tag',
    [ContentType.SmartTag]: 'smart tag',
    [ContentType.ActionsExtension]: 'action-based extension',
    [ContentType.Component]: 'component',
    [ContentType.Editor]: 'editor',
    [ContentType.Theme]: 'theme',
    [ContentType.ServerExtension]: 'server extension',
    [ContentType.Mfa]: 'two-factor authentication setting',
    [ContentType.FilesafeCredentials]: 'FileSafe credential',
    [ContentType.FilesafeFileMetadata]: 'FileSafe file',
    [ContentType.FilesafeIntegration]: 'FileSafe integration',
  };
  return map[contentType];
}

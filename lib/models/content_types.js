export const CONTENT_TYPE_ITEM                     = 'SF|Item';
export const CONTENT_TYPE_ROOT_KEY                 = 'SN|RootKey|NoSync';
export const CONTENT_TYPE_ITEMS_KEY                = 'SN|ItemsKey';
export const CONTENT_TYPE_ENCRYPTED_STORAGE        = 'SN|EncryptedStorage';
export const CONTENT_TYPE_NOTE                     = 'Note';
export const CONTENT_TYPE_TAG                      = 'Tag';
export const CONTENT_TYPE_SMART_TAG                = 'SN|SmartTag';
export const CONTENT_TYPE_COMPONENT                = 'SN|Component';
export const CONTENT_TYPE_EDITOR                   = 'SN|Editor';
export const CONTENT_TYPE_ACTIONS                  = 'SN|Extension';
export const CONTENT_TYPE_USER_PREFS               = 'SN|UserPreferences';
export const CONTENT_TYPE_PRIVILEGES               = 'SN|Privileges';
export const CONTENT_TYPE_HISTORY_SESSION          = 'SN|HistorySession';
export const CONTENT_TYPE_THEME                    = 'SN|Theme';
export const CONTENT_TYPE_MFA                      = 'SF|MFA';
export const CONTENT_TYPE_SERVER_EXTENSION         = 'SF|Extension';
export const CONTENT_TYPE_FILESAFE_CREDENTIALS     = 'SN|FileSafe|Credentials';
export const CONTENT_TYPE_FILESAFE_FILE_METADATA   = 'SN|FileSafe|FileMetadata';
export const CONTENT_TYPE_FILESAFE_INTEGRATION     = 'SN|FileSafe|Integration';

export function displayStringForContentType(contentType) {
  return {
    [CONTENT_TYPE_NOTE] : "note",
    [CONTENT_TYPE_TAG] : "tag",
    [CONTENT_TYPE_SMART_TAG] : "smart tag",
    [CONTENT_TYPE_ACTIONS] : "action-based extension",
    [CONTENT_TYPE_COMPONENT] : "component",
    [CONTENT_TYPE_EDITOR] : "editor",
    [CONTENT_TYPE_THEME] : "theme",
    [CONTENT_TYPE_SERVER_EXTENSION] : "server extension",
    [CONTENT_TYPE_MFA] : "two-factor authentication setting",
    [CONTENT_TYPE_FILESAFE_CREDENTIALS]: "FileSafe credential",
    [CONTENT_TYPE_FILESAFE_FILE_METADATA]: "FileSafe file",
    [CONTENT_TYPE_FILESAFE_INTEGRATION]: "FileSafe integration"
  }[contentType];
}

export declare const DefaultAppDomain = "org.standardnotes.sn";
export declare enum ContentType {
    Any = "*",
    Item = "SF|Item",
    RootKey = "SN|RootKey|NoSync",
    ItemsKey = "SN|ItemsKey",
    EncryptedStorage = "SN|EncryptedStorage",
    Note = "Note",
    Tag = "Tag",
    SmartTag = "SN|SmartTag",
    Component = "SN|Component",
    Editor = "SN|Editor",
    ActionsExtension = "Extension",
    UserPrefs = "SN|UserPreferences",
    Privileges = "SN|Privileges",
    HistorySession = "SN|HistorySession",
    Theme = "SN|Theme",
    Mfa = "SF|MFA",
    ServerExtension = "SF|Extension",
    FilesafeCredentials = "SN|FileSafe|Credentials",
    FilesafeFileMetadata = "SN|FileSafe|FileMetadata",
    FilesafeIntegration = "SN|FileSafe|Integration",
    ExtensionRepo = "SN|ExtensionRepo"
}
export declare function displayStringForContentType(contentType: ContentType): string;

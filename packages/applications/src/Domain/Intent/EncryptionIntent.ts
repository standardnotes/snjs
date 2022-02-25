export enum EncryptionIntent {
  Sync = 0,
  LocalStorageEncrypted = 2,
  LocalStorageDecrypted = 3,
  /** Store encrypted if possible, but decrypted if not */
  LocalStoragePreferEncrypted = 4,
  FileEncrypted = 5,
  FileDecrypted = 6,
  FilePreferEncrypted = 7,
}

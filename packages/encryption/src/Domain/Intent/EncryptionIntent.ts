export enum EncryptionIntent {
  Sync = 0,
  LocalStorageEncrypted = 2,
  LocalStorageDecrypted = 3,
  FileEncrypted = 5,
  FileDecrypted = 6,
}

export type EncryptedEncryptionIntent =
  | EncryptionIntent.Sync
  | EncryptionIntent.LocalStorageEncrypted
  | EncryptionIntent.FileEncrypted

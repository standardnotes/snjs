export enum EncryptionIntent {
  Sync = 0,
  /** Permissible only for server extensions */
  SyncDecrypted = 1,
  LocalStorageEncrypted = 2,
  LocalStorageDecrypted = 3,
  /** Store encrypted if possible, but decrypted if not */
  LocalStoragePreferEncrypted = 4,
  FileEncrypted = 5,
  FileDecrypted = 6,
  FilePreferEncrypted = 7,
};

export function isLocalStorageIntent(intent: EncryptionIntent) {
  return (
    intent === EncryptionIntent.LocalStorageEncrypted ||
    intent === EncryptionIntent.LocalStorageDecrypted ||
    intent === EncryptionIntent.LocalStoragePreferEncrypted
  );
}

export function isFileIntent(intent: EncryptionIntent) {
  return (
    intent === EncryptionIntent.FileEncrypted ||
    intent === EncryptionIntent.FileDecrypted ||
    intent === EncryptionIntent.FilePreferEncrypted
  );
}

export function isDecryptedIntent(intent: EncryptionIntent) {
  return (
    intent === EncryptionIntent.SyncDecrypted ||
    intent === EncryptionIntent.LocalStorageDecrypted ||
    intent === EncryptionIntent.FileDecrypted
  );
}

/**
 * @returns {boolean}  True if the intent requires encryption.
 */
export function intentRequiresEncryption(intent: EncryptionIntent) {
  return (
    intent === EncryptionIntent.Sync ||
    intent === EncryptionIntent.LocalStorageEncrypted ||
    intent === EncryptionIntent.FileEncrypted
  );
}

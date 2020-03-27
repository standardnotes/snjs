export enum EncryptionIntents {
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

export function isLocalStorageIntent(intent: EncryptionIntents) {
  return (
    intent === EncryptionIntents.LocalStorageEncrypted ||
    intent === EncryptionIntents.LocalStorageDecrypted ||
    intent === EncryptionIntents.LocalStoragePreferEncrypted
  );
}

export function isFileIntent(intent: EncryptionIntents) {
  return (
    intent === EncryptionIntents.FileEncrypted ||
    intent === EncryptionIntents.FileDecrypted ||
    intent === EncryptionIntents.FilePreferEncrypted
  );
}

export function isDecryptedIntent(intent: EncryptionIntents) {
  return (
    intent === EncryptionIntents.SyncDecrypted ||
    intent === EncryptionIntents.LocalStorageDecrypted ||
    intent === EncryptionIntents.FileDecrypted
  );
}

/**
 * @returns {boolean}  True if the intent requires encryption.
 */
export function intentRequiresEncryption(intent: EncryptionIntents) {
  return (
    intent === EncryptionIntents.Sync ||
    intent === EncryptionIntents.LocalStorageEncrypted ||
    intent === EncryptionIntents.FileEncrypted
  );
}

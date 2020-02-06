export const EncryptionIntents = {
  Sync: 0,
  LocalStorageEncrypted: 1,
  LocalStorageDecrypted: 2,
  /** Store encrypted if possible, but decrypted if not */
  LocalStoragePreferEncrypted: 3,
  FileEncrypted: 4,
  FileDecrypted: 5,
};

export function isLocalStorageIntent(intent) {
  return (
    intent === EncryptionIntents.LocalStorageEncrypted ||
    intent === EncryptionIntents.LocalStorageDecrypted ||
    intent === EncryptionIntents.LocalStoragePreferEncrypted
  );
}

export function isFileIntent(intent) {
  return (
    intent === EncryptionIntents.FileEncrypted ||
    intent === EncryptionIntents.FileDecrypted
  );
}

export function isDecryptedIntent(intent) {
  return (
    intent === EncryptionIntents.LocalStorageDecrypted ||
    intent === EncryptionIntents.FileDecrypted
  );
}

/**
 * @returns {boolean}  True if the intent requires encryption.
 */
export function intentRequiresEncryption(intent) {
  return (
    intent === EncryptionIntents.Sync ||
    intent === EncryptionIntents.LocalStorageEncrypted ||
    intent === EncryptionIntents.FileEncrypted
  );
}

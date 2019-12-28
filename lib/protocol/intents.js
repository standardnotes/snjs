export const EncryptionIntentSync                         = 0;
export const EncryptionIntentLocalStorageEncrypted        = 1;
export const EncryptionIntentLocalStorageDecrypted        = 2;
export const EncryptionIntentLocalStoragePreferEncrypted  = 3; /** Store encrypted if possible, but decrypted if not */
export const EncryptionIntentFileEncrypted                = 4;
export const EncryptionIntentFileDecrypted                = 5;

export function isLocalStorageIntent(intent) {
  return (
    intent === EncryptionIntentLocalStorageEncrypted ||
    intent === EncryptionIntentLocalStorageDecrypted ||
    intent === EncryptionIntentLocalStoragePreferEncrypted
  );
}

export function isFileIntent(intent) {
  return (
    intent === EncryptionIntentFileEncrypted ||
    intent === EncryptionIntentFileDecrypted
  );
}

export function isDecryptedIntent(intent) {
  return intent === EncryptionIntentLocalStorageDecrypted || intent === EncryptionIntentFileDecrypted;
}

/**
 * @returns {boolean}  True if the intent requires encryption.
 */
export function intentRequiresEncryption(intent) {
  return (
    intent === EncryptionIntentSync ||
    intent === EncryptionIntentLocalStorageEncrypted ||
    intent === EncryptionIntentFileEncrypted
  );
}

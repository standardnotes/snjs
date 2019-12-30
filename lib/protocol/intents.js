export const ENCRYPTION_INTENT_SYNC                            = 0;
export const ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED         = 1;
export const ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED         = 2;
export const ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED  = 3; /** Store encrypted if possible, but decrypted if not */
export const ENCRYPTION_INTENT_FILE_ENCRYPTED                  = 4;
export const ENCRYPTION_INTENT_FILE_DECRYPTED                  = 5;

export function isLocalStorageIntent(intent) {
  return (
    intent === ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED ||
    intent === ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED ||
    intent === ENCRYPTION_INTENT_LOCAL_STORAGE_PREFER_ENCRYPTED
  );
}

export function isFileIntent(intent) {
  return (
    intent === ENCRYPTION_INTENT_FILE_ENCRYPTED ||
    intent === ENCRYPTION_INTENT_FILE_DECRYPTED
  );
}

export function isDecryptedIntent(intent) {
  return (
    intent === ENCRYPTION_INTENT_LOCAL_STORAGE_DECRYPTED ||
    intent === ENCRYPTION_INTENT_FILE_DECRYPTED
  );
}

/**
 * @returns {boolean}  True if the intent requires encryption.
 */
export function intentRequiresEncryption(intent) {
  return (
    intent === ENCRYPTION_INTENT_SYNC ||
    intent === ENCRYPTION_INTENT_LOCAL_STORAGE_ENCRYPTED ||
    intent === ENCRYPTION_INTENT_FILE_ENCRYPTED
  );
}

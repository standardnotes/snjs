import { ContentType } from '@standardnotes/common';
/**
 * Only three types of items should be encrypted with a root key:
 * - A root key is encrypted with another root key in the case of root key wrapping
 * - An SNItemsKey object
 * - An encrypted storage object (local)
 */
export function ContentTypeUsesRootKeyEncryption(contentType: ContentType) {
  return (
    contentType === ContentType.RootKey ||
    contentType === ContentType.ItemsKey ||
    contentType === ContentType.EncryptedStorage
  );
}

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
}

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
 * @returns True if the intent requires encryption.
 */
export function intentRequiresEncryption(intent: EncryptionIntent) {
  return (
    intent === EncryptionIntent.Sync ||
    intent === EncryptionIntent.LocalStorageEncrypted ||
    intent === EncryptionIntent.FileEncrypted
  );
}

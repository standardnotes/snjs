import { ContentType } from './../models/content_types';
/**
 * Only three types of items should be encrypted with a root key:
 * - A root key is encrypted with another root key in the case of root key wrapping
 * - An SNItemsKey object
 * - An encrypted storage object (local)
 */
export declare function ContentTypeUsesRootKeyEncryption(contentType: ContentType): boolean;
export declare enum EncryptionIntent {
    Sync = 0,
    /** Permissible only for server extensions */
    SyncDecrypted = 1,
    LocalStorageEncrypted = 2,
    LocalStorageDecrypted = 3,
    /** Store encrypted if possible, but decrypted if not */
    LocalStoragePreferEncrypted = 4,
    FileEncrypted = 5,
    FileDecrypted = 6,
    FilePreferEncrypted = 7
}
export declare function isLocalStorageIntent(intent: EncryptionIntent): boolean;
export declare function isFileIntent(intent: EncryptionIntent): boolean;
export declare function isDecryptedIntent(intent: EncryptionIntent): boolean;
/**
 * @returns True if the intent requires encryption.
 */
export declare function intentRequiresEncryption(intent: EncryptionIntent): boolean;

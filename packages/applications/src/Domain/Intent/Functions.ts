import { ContentType } from '@standardnotes/common'
import { EncryptionIntent } from './EncryptionIntent'

/**
 * Only three types of items should be encrypted with a root key:
 * - A root key is encrypted with another root key in the case of root key wrapping
 * - An SNItemsKey object
 * - An encrypted storage object (local)
 */
export function ContentTypeUsesRootKeyEncryption(contentType: ContentType): boolean {
  return (
    contentType === ContentType.RootKey ||
    contentType === ContentType.ItemsKey ||
    contentType === ContentType.EncryptedStorage
  )
}

export function ItemContentTypeUsesRootKeyEncryption(contentType: ContentType): boolean {
  return contentType === ContentType.ItemsKey
}

export function isLocalStorageIntent(intent: EncryptionIntent): boolean {
  return (
    intent === EncryptionIntent.LocalStorageEncrypted ||
    intent === EncryptionIntent.LocalStorageDecrypted ||
    intent === EncryptionIntent.LocalStoragePreferEncrypted
  )
}

export function isFileIntent(intent: EncryptionIntent): boolean {
  return (
    intent === EncryptionIntent.FileEncrypted ||
    intent === EncryptionIntent.FileDecrypted ||
    intent === EncryptionIntent.FilePreferEncrypted
  )
}

export function isDecryptedIntent(intent: EncryptionIntent): boolean {
  return (
    intent === EncryptionIntent.LocalStorageDecrypted || intent === EncryptionIntent.FileDecrypted
  )
}

/**
 * @returns True if the intent requires encryption.
 */
export function intentRequiresEncryption(intent: EncryptionIntent): boolean {
  return (
    intent === EncryptionIntent.Sync ||
    intent === EncryptionIntent.LocalStorageEncrypted ||
    intent === EncryptionIntent.FileEncrypted
  )
}

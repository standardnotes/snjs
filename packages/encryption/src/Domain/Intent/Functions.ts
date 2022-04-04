import { ContentType } from '@standardnotes/common'
import {
  EncryptedPayloadInterface,
  createEncryptedPayloadForFileExport,
  createEncryptedPayloadForSync,
  createEncryptedPayloadForLocalStorage,
  DecryptedPayloadInterface,
  createDecryptedPayloadForFileExport,
  createDecryptedPayloadForLocalStorage,
} from '@standardnotes/models'
import { EncryptedParameters } from '../Encryption/EncryptedParameters'
import { EncryptedExportIntent, DecryptedExportIntent } from './ExportIntent'

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

/**
 * @returns True if the intent requires encryption.
 */
export function intentRequiresEncryption(
  intent: EncryptedExportIntent | EncryptedExportIntent,
): boolean {
  return (
    intent === EncryptedExportIntent.Sync ||
    intent === EncryptedExportIntent.LocalStorageEncrypted ||
    intent === EncryptedExportIntent.FileEncrypted
  )
}

export function CreateEncryptedContextPayload(
  fromPayload: EncryptedPayloadInterface,
  intent: EncryptedExportIntent,
): EncryptedPayloadInterface {
  switch (intent) {
    case EncryptedExportIntent.Sync:
      return createEncryptedPayloadForSync(fromPayload)
    case EncryptedExportIntent.FileEncrypted:
      return createEncryptedPayloadForFileExport(fromPayload)
    case EncryptedExportIntent.LocalStorageEncrypted:
      return createEncryptedPayloadForLocalStorage(fromPayload)
  }
}

export function CreateDecryptedContextPayload(
  fromPayload: DecryptedPayloadInterface,
  intent: DecryptedExportIntent,
): DecryptedPayloadInterface {
  switch (intent) {
    case DecryptedExportIntent.FileDecrypted:
      return createDecryptedPayloadForFileExport(fromPayload)
    case DecryptedExportIntent.LocalStorageDecrypted:
      return createDecryptedPayloadForLocalStorage(fromPayload)
  }
}

export function encryptedParametersFromPayload(
  payload: EncryptedPayloadInterface,
): EncryptedParameters {
  return {
    uuid: payload.uuid,
    content: payload.content,
    items_key_id: payload.items_key_id,
    enc_item_key: payload.enc_item_key as string,
    version: payload.version,
    auth_hash: payload.auth_hash,
  }
}

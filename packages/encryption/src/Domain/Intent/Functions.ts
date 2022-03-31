import { ContentType } from '@standardnotes/common'
import {
  CopyPayload,
  CreatePayload,
  FilePayloadFields,
  PayloadInterface,
  PayloadOverride,
  PayloadSource,
  PurePayload,
  RawPayload,
  ServerPayloadFields,
  StoragePayloadFields,
} from '@standardnotes/payloads'
import {
  DecryptedParameters,
  EncryptedParameters,
  ErroredDecryptingParameters,
} from '../Encryption/EncryptedParameters'
import { EncryptionIntent } from './EncryptionIntent'

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
    intent === EncryptionIntent.LocalStorageDecrypted
  )
}

export function isFileIntent(intent: EncryptionIntent): boolean {
  return intent === EncryptionIntent.FileEncrypted || intent === EncryptionIntent.FileDecrypted
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

function payloadFieldsForIntent(intent: EncryptionIntent) {
  if (intent === EncryptionIntent.FileEncrypted || intent === EncryptionIntent.FileDecrypted) {
    return FilePayloadFields.slice()
  }

  if (
    intent === EncryptionIntent.LocalStorageDecrypted ||
    intent === EncryptionIntent.LocalStorageEncrypted
  ) {
    return StoragePayloadFields.slice()
  }

  if (intent === EncryptionIntent.Sync) {
    return ServerPayloadFields.slice()
  } else {
    throw `No payload fields found for intent ${intent}`
  }
}

export function CreateIntentPayloadFromObject(
  object: RawPayload,
  intent: EncryptionIntent,
  override?: PayloadOverride,
): PayloadInterface {
  const payloadFields = payloadFieldsForIntent(intent)
  return CreatePayload(object, payloadFields, PayloadSource.Constructor, override)
}

export function mergePayloadWithEncryptionParameters(
  payload: PurePayload,
  parameters: EncryptedParameters | DecryptedParameters | ErroredDecryptingParameters,
): PurePayload {
  return CopyPayload(payload, parameters)
}

export function encryptedParametersFromPayload(payload: PurePayload): EncryptedParameters {
  return {
    uuid: payload.uuid,
    content: payload.contentString,
    items_key_id: payload.items_key_id,
    enc_item_key: payload.enc_item_key as string,
    version: payload.version,
    auth_hash: payload.auth_hash,
  }
}

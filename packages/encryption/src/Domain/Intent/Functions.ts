import { ContentType } from '@standardnotes/common'
import { EncryptedPayloadInterface } from '@standardnotes/models'
import { EncryptedParameters } from '../Encryption/EncryptedParameters'

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

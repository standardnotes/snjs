import { Uuid } from '@standardnotes/common'
import { DeletedPayloadInterface, EncryptedPayloadInterface } from '../Payload'
import { ContextPayload } from './ContextPayload'

export interface ServerSyncContextualPayload extends ContextPayload {
  auth_hash?: string
  content?: string
  created_at_timestamp: number
  created_at: Date
  deleted: boolean
  duplicate_of?: Uuid
  enc_item_key?: string
  items_key_id?: string
  updated_at_timestamp: number
  updated_at: Date
}

export function createEncryptedSyncContextPayload(
  fromPayload: EncryptedPayloadInterface,
): ServerSyncContextualPayload {
  return {
    content_type: fromPayload.content_type,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    deleted: fromPayload.deleted,
    duplicate_of: fromPayload.duplicate_of,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
    content: fromPayload.content,
    enc_item_key: fromPayload.enc_item_key,
    items_key_id: fromPayload.items_key_id,
    auth_hash: fromPayload.auth_hash,
  }
}

export function createDeletedSyncContextPayload(
  fromPayload: DeletedPayloadInterface,
): ServerSyncContextualPayload {
  return {
    content_type: fromPayload.content_type,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    deleted: fromPayload.deleted,
    duplicate_of: fromPayload.duplicate_of,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
    content: undefined,
  }
}

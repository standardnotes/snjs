import { Uuid } from '@standardnotes/common'
import { ContextPayload } from './ContextPayload'
import { ItemContent } from '../Item'
import {
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
} from '../Payload'

export interface LocalStorageEncryptedContextualPayload extends ContextPayload {
  auth_hash?: string
  auth_params?: unknown
  content: string
  created_at_timestamp?: number
  created_at: Date
  dirtiedDate: Date | undefined
  dirty: boolean
  duplicate_of: Uuid | undefined
  enc_item_key: string
  errorDecrypting: boolean | undefined
  items_key_id: string | undefined
  updated_at_timestamp: number | undefined
  updated_at: Date | undefined
  waitingForKey: boolean | undefined
}

export interface LocalStorageDecryptedContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  content: C
  created_at_timestamp?: number
  created_at: Date
  dirtiedDate: Date | undefined
  dirty: boolean
  duplicate_of?: Uuid
  updated_at_timestamp: number | undefined
  updated_at: Date | undefined
}

export interface LocalStorageDeletedContextualPayload extends ContextPayload {
  content: undefined
  created_at_timestamp?: number
  created_at: Date
  deleted: true
  dirtiedDate: Date | undefined
  dirty: true
  duplicate_of?: Uuid
  updated_at_timestamp: number | undefined
  updated_at: Date | undefined
}

export function createEncryptedLocalStorageContextPayload(
  fromPayload: EncryptedPayloadInterface,
): LocalStorageEncryptedContextualPayload {
  return {
    auth_hash: fromPayload.auth_hash,
    content_type: fromPayload.content_type,
    content: fromPayload.content,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    dirtiedDate: fromPayload.dirtiedDate,
    dirty: fromPayload.dirty || false,
    duplicate_of: fromPayload.duplicate_of,
    enc_item_key: fromPayload.enc_item_key,
    errorDecrypting: fromPayload.errorDecrypting,
    items_key_id: fromPayload.items_key_id,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
    waitingForKey: fromPayload.waitingForKey,
  }
}

export function createDecryptedLocalStorageContextPayload(
  fromPayload: DecryptedPayloadInterface,
): LocalStorageDecryptedContextualPayload {
  return {
    content_type: fromPayload.content_type,
    content: fromPayload.content,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    duplicate_of: fromPayload.duplicate_of,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
    dirty: fromPayload.dirty || false,
    dirtiedDate: fromPayload.dirtiedDate,
  }
}

export function createDeletedLocalStorageContextPayload(
  fromPayload: DeletedPayloadInterface,
): LocalStorageDeletedContextualPayload {
  return {
    content_type: fromPayload.content_type,
    content: undefined,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    deleted: true,
    dirtiedDate: fromPayload.dirtiedDate,
    dirty: true,
    duplicate_of: fromPayload.duplicate_of,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
  }
}

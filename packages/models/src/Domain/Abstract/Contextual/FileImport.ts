import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../Item/Interfaces/ItemContent'
import {
  DecryptedTransferPayload,
  EncryptedTransferPayload,
  isEncryptedTransferPayload,
} from '../TransferPayload'
import { ContextPayload } from './ContextPayload'

export interface FileImportContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  auth_hash?: string
  content: C | string
  created_at_timestamp?: number
  created_at?: Date
  duplicate_of?: Uuid
  enc_item_key?: string
  items_key_id?: string
  updated_at?: Date
  updated_at_timestamp?: number
}

export function createFileImportContextPayload(
  fromPayload: EncryptedTransferPayload | DecryptedTransferPayload,
): FileImportContextualPayload {
  const base = {
    content_type: fromPayload.content_type,
    content: fromPayload.content,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    duplicate_of: fromPayload.duplicate_of,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
  }

  if (isEncryptedTransferPayload(fromPayload)) {
    return {
      ...base,
      enc_item_key: fromPayload.enc_item_key,
      items_key_id: fromPayload.items_key_id,
      auth_hash: fromPayload.auth_hash,
    }
  } else {
    return base
  }
}

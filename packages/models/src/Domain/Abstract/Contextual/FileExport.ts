import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../Item'
import { ContextPayload } from './ContextPayload'
import {
  DecryptedPayload,
  DecryptedPayloadInterface,
  EncryptedPayload,
  EncryptedPayloadInterface,
} from '../Payload'
import { EncryptedTransferPayload } from '../TransferPayload/Interfaces/EncryptedTransferPayload'
import { DecryptedTransferPayload } from '../TransferPayload/Interfaces/DecryptedTransferPayload'

export interface FileEncryptedExportContextualPayload extends ContextPayload {
  auth_hash?: string
  content: string
  created_at_timestamp?: number
  created_at?: Date
  duplicate_of?: Uuid
  enc_item_key: string
  items_key_id?: string
  updated_at?: Date
  updated_at_timestamp?: number
}

export interface FileDecryptedExportContextualPayload<C extends ItemContent = ItemContent>
  extends ContextPayload {
  content: C
  created_at_timestamp?: number
  created_at?: Date
  duplicate_of?: Uuid
  updated_at?: Date
  updated_at_timestamp?: number
}

export function createEncryptedPayloadForFileExport(
  fromPayload: EncryptedPayloadInterface,
): EncryptedPayloadInterface {
  const params: FileEncryptedExportContextualPayload = {
    auth_hash: fromPayload.auth_hash,
    content_type: fromPayload.content_type,
    content: fromPayload.content,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    duplicate_of: fromPayload.duplicate_of,
    enc_item_key: fromPayload.enc_item_key,
    items_key_id: fromPayload.items_key_id,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
  }
  return new EncryptedPayload(params as EncryptedTransferPayload)
}

export function createDecryptedPayloadForFileExport(
  fromPayload: DecryptedPayloadInterface,
): DecryptedPayloadInterface {
  const params: FileDecryptedExportContextualPayload = {
    content_type: fromPayload.content_type,
    content: fromPayload.content,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    duplicate_of: fromPayload.duplicate_of,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
  }
  return new DecryptedPayload(params as DecryptedTransferPayload)
}

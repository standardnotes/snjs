import { Uuid } from '@standardnotes/common'
import { ItemContent } from '../Item'
import { DecryptedPayloadInterface, DeletedPayloadInterface, isDecryptedPayload } from '../Payload'
import { ContextPayload } from './ContextPayload'

export interface OfflineSyncPushContextualPayload extends ContextPayload {
  content?: ItemContent
  created_at_timestamp: number
  created_at: Date
  deleted?: boolean
  duplicate_of?: Uuid
  updated_at_timestamp: number
  updated_at: Date
}

export function CreateOfflineSyncPushContextPayload(
  fromPayload: DecryptedPayloadInterface | DeletedPayloadInterface,
): OfflineSyncPushContextualPayload {
  const base: OfflineSyncPushContextualPayload = {
    content_type: fromPayload.content_type,
    created_at_timestamp: fromPayload.created_at_timestamp,
    created_at: fromPayload.created_at,
    duplicate_of: fromPayload.duplicate_of,
    updated_at_timestamp: fromPayload.updated_at_timestamp,
    updated_at: fromPayload.updated_at,
    uuid: fromPayload.uuid,
  }
  if (isDecryptedPayload(fromPayload)) {
    return {
      ...base,
      content: fromPayload.content,
    }
  } else {
    return {
      ...base,
      deleted: fromPayload.deleted,
    }
  }
}

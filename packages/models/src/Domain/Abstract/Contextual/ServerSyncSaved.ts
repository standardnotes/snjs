import { ContextPayload } from './ContextPayload'
import { useBoolean } from '@standardnotes/utils'
import { FilteredServerItem } from './FilteredServerItem'

/**
 * The saved sync item payload represents the payload we want to map
 * when mapping saved_items from the server. We only want to map the
 * updated_at value the server returns for the item, and basically
 * nothing else.
 */
export interface ServerSyncSavedContextualPayload extends ContextPayload {
  content: undefined
  created_at_timestamp: number
  updated_at_timestamp?: number
  updated_at: Date
}

export function CreateServerSyncSavedPayload(
  from: FilteredServerItem,
): ServerSyncSavedContextualPayload {
  return {
    content: undefined,
    content_type: from.content_type,
    created_at_timestamp: from.created_at_timestamp,
    deleted: useBoolean(from.deleted, false),
    updated_at_timestamp: from.updated_at_timestamp,
    updated_at: from.updated_at,
    uuid: from.uuid,
  }
}

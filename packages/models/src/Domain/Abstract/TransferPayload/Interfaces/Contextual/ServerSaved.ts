import { TransferPayload } from './../TransferPayload'

/**
 * The saved sync item payload represents the payload we want to map
 * when mapping saved_items from the server or local sync mechanism. We only want to map the
 * updated_at value the server returns for the item, and basically
 * nothing else.
 */
export interface SyncSavedTransferPayload extends TransferPayload {
  content: undefined
  created_at_timestamp: number
  deleted?: boolean
  dirty?: boolean
  lastSyncEnd?: Date
  updated_at_timestamp?: number
  updated_at: Date
}

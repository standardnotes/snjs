import { ValidPayloadKey } from './../../../Payload/Types/PayloadField'
import { PayloadField } from '../../../Payload'
import { TransferPayload } from './../TransferPayload'

export const SyncSavedPayloadFields: Readonly<ValidPayloadKey[]> = Object.freeze([
  PayloadField.ContentType,
  PayloadField.CreatedAtTimestamp,
  PayloadField.Deleted,
  PayloadField.Dirty,
  PayloadField.LastSyncEnd,
  PayloadField.ServerUpdatedAt,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.Uuid,
])

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

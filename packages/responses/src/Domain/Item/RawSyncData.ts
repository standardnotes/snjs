/* eslint-disable @typescript-eslint/no-explicit-any */
import { TransferPayload } from '@standardnotes/models'
import { ApiEndpointParam } from './ApiEndpointParam'
import { ConflictParams } from './ConflictParams'

export type RawSyncData = {
  error?: any
  [ApiEndpointParam.LastSyncToken]?: string
  [ApiEndpointParam.PaginationToken]?: string
  retrieved_items?: TransferPayload[]
  saved_items?: TransferPayload[]
  conflicts?: ConflictParams[]
  unsaved?: ConflictParams[]
  status?: number
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiEndpointParam, RawPayload } from '@standardnotes/payloads'
import { ConflictParams } from './ConflictParams'

export type RawSyncData = {
  error?: any
  [ApiEndpointParam.LastSyncToken]?: string
  [ApiEndpointParam.PaginationToken]?: string
  [ApiEndpointParam.IntegrityResult]?: string
  retrieved_items?: RawPayload[]
  saved_items?: RawPayload[]
  conflicts?: ConflictParams[]
  unsaved?: ConflictParams[]
  status?: number
}

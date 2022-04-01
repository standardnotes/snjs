/* eslint-disable @typescript-eslint/no-explicit-any */
import { RawPayload } from '@standardnotes/models'
import { ApiEndpointParam } from './ApiEndpointParam'
import { ConflictParams } from './ConflictParams'

export type RawSyncData = {
  error?: any
  [ApiEndpointParam.LastSyncToken]?: string
  [ApiEndpointParam.PaginationToken]?: string
  retrieved_items?: RawPayload[]
  saved_items?: RawPayload[]
  conflicts?: ConflictParams[]
  unsaved?: ConflictParams[]
  status?: number
}

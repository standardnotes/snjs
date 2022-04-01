import { RawPayload } from '@standardnotes/models'
import { SyncSource } from '../Sync/SyncSource'

export type IntegrityEventPayload = {
  rawPayloads: RawPayload[]
  source: SyncSource
}

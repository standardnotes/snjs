import { RawPayload } from '@standardnotes/payloads'
import { SyncSource } from '../Sync/SyncSource'

export type IntegrityEventPayload = {
  rawPayloads: RawPayload[]
  source: SyncSource
}

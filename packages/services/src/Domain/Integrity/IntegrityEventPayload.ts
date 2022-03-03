import { RawPayload } from '@standardnotes/payloads'
import { SyncSources } from '../Sync/SyncSources'

export type IntegrityEventPayload = {
  rawPayloads: RawPayload[]
  source: SyncSources
}

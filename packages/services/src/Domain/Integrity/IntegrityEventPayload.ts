import { TransferPayload } from '@standardnotes/models'
import { SyncSource } from '../Sync/SyncSource'

export type IntegrityEventPayload = {
  rawPayloads: TransferPayload[]
  source: SyncSource
}

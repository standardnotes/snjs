import { IntegrityPayload } from '@standardnotes/payloads'
import { MinimalHttpResponse } from '../Http/MinimalHttpResponses'

export type CheckIntegrityResponse = MinimalHttpResponse & {
  data: {
    mismatches: IntegrityPayload[]
  }
}

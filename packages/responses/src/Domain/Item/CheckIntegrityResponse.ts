import { IntegrityPayload } from '@standardnotes/models'
import { MinimalHttpResponse } from '../Http/MinimalHttpResponses'

export type CheckIntegrityResponse = MinimalHttpResponse & {
  data: {
    mismatches: IntegrityPayload[]
  }
}

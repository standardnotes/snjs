import { IntegrityPayload } from '@standardnotes/payloads'
import { CheckIntegrityResponse } from '@standardnotes/responses'

export interface IntegrityApiInterface {
  checkIntegrity(integrityPayloads: IntegrityPayload[]): Promise<CheckIntegrityResponse>
}

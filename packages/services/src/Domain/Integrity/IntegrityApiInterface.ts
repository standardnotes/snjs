import { IntegrityPayload } from '@standardnotes/models'
import { CheckIntegrityResponse } from '@standardnotes/responses'

export interface IntegrityApiInterface {
  checkIntegrity(integrityPayloads: IntegrityPayload[]): Promise<CheckIntegrityResponse>
}

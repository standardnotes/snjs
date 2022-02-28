import { IntegrityPayload } from '@standardnotes/payloads'
import { CheckIntegrityResponse, HttpResponse } from '@standardnotes/responses'

export interface IntegrityApiInterface {
  checkIntegrity(integrityPayloads: IntegrityPayload[]): Promise<CheckIntegrityResponse | HttpResponse>
}

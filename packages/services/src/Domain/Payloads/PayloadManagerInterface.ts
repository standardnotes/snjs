import { PayloadSource, PayloadInterface, EncryptedPayloadInterface } from '@standardnotes/models'
import { IntegrityPayload } from '@standardnotes/responses'

export interface PayloadManagerInterface {
  emitPayloads(
    payloads: PayloadInterface[],
    source: PayloadSource,
    sourceKey?: string,
  ): Promise<PayloadInterface[]>

  integrityPayloads: IntegrityPayload[]

  get invalidPayloads(): EncryptedPayloadInterface[]
}

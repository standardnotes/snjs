import { PayloadSource, PayloadInterface, IntegrityPayload } from '@standardnotes/models'

export interface PayloadManagerInterface {
  emitPayloads(
    payloads: PayloadInterface[],
    source: PayloadSource,
    sourceKey?: string,
  ): Promise<PayloadInterface[]>

  integrityPayloads: IntegrityPayload[]
}

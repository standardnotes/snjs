import { PayloadSource, PurePayload } from '@standardnotes/payloads'

export interface PayloadManagerInterface {
  emitPayloads(
    payloads: PurePayload[],
    source: PayloadSource,
    sourceKey?: string,
  ): Promise<PurePayload[]>
}

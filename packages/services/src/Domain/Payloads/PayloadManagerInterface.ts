import { PayloadSource, PurePayload } from '@standardnotes/models'

export interface PayloadManagerInterface {
  emitPayloads(
    payloads: PurePayload[],
    source: PayloadSource,
    sourceKey?: string,
  ): Promise<PurePayload[]>
}

import {
  PayloadSource,
  PayloadInterface,
  EncryptedPayloadInterface,
  FullyFormedPayloadInterface,
} from '@standardnotes/models'
import { IntegrityPayload } from '@standardnotes/responses'

export interface PayloadManagerInterface {
  emitPayloads(
    payloads: PayloadInterface[],
    source: PayloadSource,
    sourceKey?: string,
  ): Promise<PayloadInterface[]>

  integrityPayloads: IntegrityPayload[]

  get invalidPayloads(): EncryptedPayloadInterface[]

  /**
   * Returns a detached array of all items which are not deleted
   */
  get nonDeletedItems(): FullyFormedPayloadInterface[]
}

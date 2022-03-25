import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { SNRootKey } from '@Lib/Protocol/root_key'
import { EncryptionIntent } from '@standardnotes/applications'
import { PurePayload } from '@standardnotes/payloads'

export interface EncryptionDelegate {
  payloadByEncryptingPayload(
    payload: PurePayload,
    intent: EncryptionIntent,
    key?: SNRootKey | SNItemsKey,
  ): Promise<PurePayload>

  payloadByDecryptingPayload(
    payload: PurePayload,
    key?: SNRootKey | SNItemsKey,
  ): Promise<PurePayload>
}

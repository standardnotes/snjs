import { SNItemsKey } from '../models/app/items_key';
import { SNRootKey } from '../protocol/root_key';
import { EncryptionIntent } from '../protocol/intents';
import { PurePayload } from '../protocol/payloads/pure_payload';
export interface EncryptionDelegate {
    payloadByEncryptingPayload(payload: PurePayload, intent: EncryptionIntent, key?: SNRootKey | SNItemsKey): Promise<PurePayload>;
    payloadByDecryptingPayload(payload: PurePayload, key?: SNRootKey | SNItemsKey): Promise<PurePayload>;
}

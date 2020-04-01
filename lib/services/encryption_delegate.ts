import { SNItemsKey } from '@Models/app/items_key';
import { SNRootKey } from '@Protocol/root_key';
import { EncryptionIntent } from '@Protocol/intents';
import { PurePayload } from '@Payloads/pure_payload';

export interface EncryptionDelegate {
    payloadByEncryptingPayload(
        payload: PurePayload,
        intent: EncryptionIntent,
        key?: SNRootKey | SNItemsKey,
    ): Promise<PurePayload>;
    
    payloadByDecryptingPayload(
        payload: PurePayload,
        key?: SNRootKey | SNItemsKey
    ): Promise<PurePayload>;
}
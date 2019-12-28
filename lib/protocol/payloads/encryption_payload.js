import { SNPurePayload } from '@Protocol/payloads/pure_payload';
import * as fields from '@Protocol/payloads/fields';

export const ENCRYPTION_PAYLOAD_TYPE_ENCRYPTED              = 0;
export const ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BARE_OBJECT  = 1;
export const ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BASE_64      = 2;

export class SNEncryptionPayload extends SNPurePayload {

  static fields() {
    return [
      fields.ITEM_PAYLOAD_ITEMS_KEY_ID,
      fields.ITEM_PAYLOAD_ENC_ITEM_KEY,
      fields.ITEM_PAYLOAD_CONTENT,
      fields.ITEM_PAYLOAD_LEGACY_003_AUTH_HASH
    ]
  }
}

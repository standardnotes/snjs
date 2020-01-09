import { SNPureItemPayload } from '@Protocol/payloads/pure_item_payload';
import * as fields from '@Protocol/payloads/fields';

/** The MaxItemPayload represents a payload with all possible fields */

export class SNMaxItemPayload extends SNPureItemPayload {
  static fields() {
    return [
      fields.ITEM_PAYLOAD_UUID,
      fields.ITEM_PAYLOAD_CONTENT_TYPE,
      fields.ITEM_PAYLOAD_ITEMS_KEY_ID,
      fields.ITEM_PAYLOAD_ENC_ITEM_KEY,
      fields.ITEM_PAYLOAD_CONTENT,
      fields.ITEM_PAYLOAD_CREATED_AT,
      fields.ITEM_PAYLOAD_UPDATED_AT,
      fields.ITEM_PAYLOAD_DELETED,
      fields.ITEM_PAYLOAD_LEGACY_003_AUTH_HASH,
      fields.ITEM_PAYLOAD_LEGACY_003_AUTH_PARAMS,
      fields.ITEM_PAYLOAD_DIRTY,
      fields.ITEM_PAYLOAD_DIRTIED_DATE,
      fields.ITEM_PAYLOAD_ERROR_DECRYPTING,
      fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED,
      fields.ITEM_PAYLOAD_WAITING_FOR_KEY,
      fields.ITEM_PAYLOAD_DUMMY,
      fields.ITEM_PAYLOAD_LAST_SYNC_BEGAN,
    ]
  }
}

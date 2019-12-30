import { SNPurePayload } from '@Protocol/payloads/pure_payload';
import { PROTOCOL_VERSION_BASE_64_DECRYPTED } from '@Protocol/versions';
import * as fields from '@Protocol/payloads/fields';
import {
  PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING,
} from '@Protocol/payloads/formats';

export class SNEncryptionParameters extends SNPurePayload {

  static fields() {
    return [
      fields.ITEM_PAYLOAD_UUID,
      fields.ITEM_PAYLOAD_ITEMS_KEY_ID,
      fields.ITEM_PAYLOAD_ENC_ITEM_KEY,
      fields.ITEM_PAYLOAD_CONTENT,
      fields.ITEM_PAYLOAD_LEGACY_003_AUTH_HASH,
      fields.ITEM_PAYLOAD_ERROR_DECRYPTING,
      fields.ITEM_PAYLOAD_ERROR_DECRYPTING_CHANGED,
      fields.ITEM_PAYLOAD_WAITING_FOR_KEY
    ]
  }

  get isEncryptionParameters() {
    return true;
  }

  getContentFormat() {
    if(typeof this.content === 'string') {
      if(this.content.startsWith(PROTOCOL_VERSION_BASE_64_DECRYPTED)) {
        return PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING;
      } else {
        return PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING
      }
    } else {
      return PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT;
    }
  }
}

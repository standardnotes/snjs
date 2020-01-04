import { SNPureItemPayload } from '@Protocol/payloads/pure_item_payload';
import * as fields from '@Protocol/payloads/fields';

/**
 * The saved server item payload represents the payload we want to map
 * when mapping saved_items from the server. We only want to map the
 * updated_at value the server returns for the item, and basically
 * nothing else.
 */
export class SNSavedServerItemPayload extends SNPureItemPayload {
  static fields() {
    return [
      fields.ITEM_PAYLOAD_UUID,
      fields.ITEM_PAYLOAD_CONTENT_TYPE,
      fields.ITEM_PAYLOAD_UPDATED_AT,
    ]
  }
}

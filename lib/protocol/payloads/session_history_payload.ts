import { SNPureItemPayload } from '@Payloads/pure_item_payload';
import { PayloadFields } from '@Payloads/fields';

/** The MaxItemPayload represents a payload with all possible fields */
export class SessionHistoryPayload extends SNPureItemPayload {
  static fields() {
    return [
      PayloadFields.Uuid,
      PayloadFields.ContentType,
      PayloadFields.Content,
      PayloadFields.UpdatedAt,
    ];
  }
}

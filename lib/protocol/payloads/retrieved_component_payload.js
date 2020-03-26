import { SNPureItemPayload } from '@Payloads/pure_item_payload';
import { PayloadFields } from '@Payloads/fields';

/** Represents a payload with permissible fields for when a 
 * payload is retrieved from a component for saving */
export class RetrievedComponentPayload extends SNPureItemPayload {
  static fields() {
    return [
      PayloadFields.Uuid,
      PayloadFields.Content,
      PayloadFields.CreatedAt
    ];
  }
}

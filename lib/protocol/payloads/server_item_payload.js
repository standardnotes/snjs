import { SNPureItemPayload, PayloadFields } from '@Payloads';

export class SNServerItemPayload extends SNPureItemPayload {
  static fields() {
    return [
      PayloadFields.Uuid,
      PayloadFields.ContentType,
      PayloadFields.ItemsKeyId,
      PayloadFields.EncItemKey,
      PayloadFields.Content,
      PayloadFields.CreatedAt,
      PayloadFields.UpdatedAt,
      PayloadFields.Deleted,
      PayloadFields.Legacy003AuthHash
    ];
  }
}

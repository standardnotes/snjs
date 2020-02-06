import { SNPureItemPayload, PayloadFields } from '@Payloads';

/** The MaxItemPayload represents a payload with all possible fields */
export class SNMaxItemPayload extends SNPureItemPayload {
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
      PayloadFields.Legacy003AuthHash,
      PayloadFields.Legacy003AuthParams,
      PayloadFields.Dirty,
      PayloadFields.DirtiedDate,
      PayloadFields.ErrorDecrypting,
      PayloadFields.ErrorDecryptingChanged,
      PayloadFields.WaitingForKey,
      PayloadFields.Dummy,
      PayloadFields.LastSyncBegan,
    ];
  }
}

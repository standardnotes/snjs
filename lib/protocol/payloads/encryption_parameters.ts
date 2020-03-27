import { ProtocolVersions } from '@Protocol/versions';
import { PurePayload } from '@Payloads/pure_payload';
import { PayloadFields } from '@Payloads/fields';
import { PayloadFormats } from '@Payloads/formats';

export type RawEncryptionParameters = {
  [key in PayloadFields]?: any;
}

export class EncryptionParameters extends PurePayload {

  static fields() {
    return [
      PayloadFields.Uuid,
      PayloadFields.ItemsKeyId,
      PayloadFields.EncItemKey,
      PayloadFields.Content,
      PayloadFields.Legacy003AuthHash,
      PayloadFields.ErrorDecrypting,
      PayloadFields.ErrorDecryptingChanged,
      PayloadFields.WaitingForKey
    ];
  }
  
  getContentFormat() {
    if(typeof this.content === 'string') {
      if(this.content.startsWith(ProtocolVersions.V000Base64Decrypted)) {
        return PayloadFormats.DecryptedBase64String;
      } else {
        return PayloadFormats.EncryptedString;
      }
    } else {
      return PayloadFormats.DecryptedBareObject;
    }
  }
}

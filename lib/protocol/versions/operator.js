import { CreateEncryptionParameters, CopyEncryptionParameters } from '@Payloads/generator';
import {
  PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT,
  PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING,
} from '@Payloads/formats';

export class SNProtocolOperator {

  constructor(crypto) {
    this.crypto = crypto;
  }

  async firstHalfOfKey(key) {
    return key.substring(0, key.length/2);
  }

  async secondHalfOfKey(key) {
    return key.substring(key.length/2, key.length);
  }

  async splitKey({key, numParts}) {
    const outputLength = key.length;
    const partLength = outputLength/numParts;
    const parts = [];
    for(let i = 0; i < numParts; i++) {
      const part = key.slice(partLength * i, partLength * (i + 1));
      parts.push(part);
    }
    return parts;
  }

  async generateEncryptionParameters({payload, key, format}) {
    if(format === PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT)  {
      return CreateEncryptionParameters({
        content: payload.content
      });
    } else if(format === PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING) {
      const jsonString = JSON.stringify(payload.content);
      const base64String = await this.crypto.base64(jsonString);
      const content = PROTOCOL_VERSION_BASE_64_DECRYPTED + base64String;
      return CreateEncryptionParameters({
        content: content
      });
    } else {
      throw `Must override generateEncryptionParameters to handle format ${format}.`;
    }
  }

  async generateDecryptedParameters({encryptedParameters, key}) {
    if(!encryptedParameters.isEncryptionParameters) {
      throw 'Atempting to generate decrypted parameters from non-parameters object.';
    }

    const format = encryptedParameters.getContentFormat();
    if(format === PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT) {
      /** No decryption required */
      return CreateEncryptionParameters(encryptedParameters);
    }
    else if(format === PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING) {
      const contentString = encryptedParameters.content.substring(
        PROTOCOL_VERSION_LENGTH,
        encryptedParameters.content.length
      );
      let decodedContent;
      try {
        const jsonString = await this.crypto.base64Decode(contentString);
        decodedContent = JSON.parse(jsonString);
      } catch (e) {
        decodedContent = encryptedParameters.content;
      }
      return CopyEncryptionParameters({
        encryptionParameters: encryptedParameters,
        override: {
          content: decodedContent
        }
      });
    } else {
      throw `Must override generateDecryptedParameters to handle format ${format}.`;
    }
  }

  encryptionPayloadType({item, key, intent}) {
    let encrypt = !isNullOrUndefined(key);
    if(item.doNotEncrypt()) {
      /** doNotEncrypt should only be respected for sync intent */
      encrypt = intent === ENCRYPTION_INTENT_SYNC;
    }

    if(encrypt) {
      return PAYLOAD_CONTENT_FORMAT_ENCRYPTED_STRING;
    } else {
      if(intent === ENCRYPTION_INTENT_SYNC) {
        return PAYLOAD_CONTENT_FORMAT_DECRYPTED_BASE_64_STRING;
      } else {
        return PAYLOAD_CONTENT_FORMAT_DECRYPTED_BARE_OBJECT;
      }
    }
  }
}

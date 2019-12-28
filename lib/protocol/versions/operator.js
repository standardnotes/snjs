import {
  ENCRYPTION_PAYLOAD_TYPE_ENCRYPTED,
  ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BARE_OBJECT,
  ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BASE_64
 } from '@Protocol/payloads/encryption_payload';

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

  encryptionPayloadType({item, key, intent}) {
    let encrypt = !isNullOrUndefined(key);
    if(item.doNotEncrypt()) {
      /** doNotEncrypt should only be respected for sync intent */
      encrypt = intent === EncryptionIntentSync;
    }

    if(encrypt) {
      return ENCRYPTION_PAYLOAD_TYPE_ENCRYPTED;
    } else {
      if(intent === EncryptionIntentSync) {
        return ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BASE_64;
      } else {
        return ENCRYPTION_PAYLOAD_TYPE_DECRYPTED_BARE_OBJECT;
      }
    }
  }
}

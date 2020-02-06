import { SNItemsKey } from '@Models/app/items_key';
import {
  CreateEncryptionParameters, 
  CopyEncryptionParameters, 
  PayloadFormats,
  CreateMaxPayloadFromAnyObject
} from '@Payloads';
import { ProtocolVersions, EncryptionIntents } from '@Protocol';
import { isNullOrUndefined } from '@Lib/utils';

export class SNProtocolOperator {

  constructor(crypto) {
    this.crypto = crypto;
  }

  async firstHalfOfKey(key) {
    return key.substring(0, key.length / 2);
  }

  async secondHalfOfKey(key) {
    return key.substring(key.length / 2, key.length);
  }

  async splitKey({ key, numParts }) {
    const outputLength = key.length;
    const partLength = outputLength / numParts;
    const parts = [];
    for (let i = 0; i < numParts; i++) {
      const part = key.slice(partLength * i, partLength * (i + 1));
      parts.push(part);
    }
    return parts;
  }

  /**
   * @protected
   */
  async generateNewItemsKeyContent() {
    throw 'Must override generateNewItemsKeyContent';
  }

  /**
   * @public
   * Creates a new random SNItemsKey to use for item encryption.
   * The consumer must save/sync this item.
   * @returns  A new SNItemsKey
   */
  async createItemsKey() {
    const content = await this.generateNewItemsKeyContent();
    const payload = CreateMaxPayloadFromAnyObject({
      object: {
        content: content
      }
    });

    const itemsKey = new SNItemsKey(payload);
    await itemsKey.initUUID();
    return itemsKey;
  }

  async generateEncryptionParameters({ payload, key, format }) {
    if (format === PayloadFormats.DecryptedBareObject) {
      return CreateEncryptionParameters({
        content: payload.content
      });
    } else if (format === PayloadFormats.DecryptedBase64String) {
      const jsonString = JSON.stringify(payload.content);
      const base64String = await this.crypto.base64(jsonString);
      const content = ProtocolVersions.V000Base64Decrypted + base64String;
      return CreateEncryptionParameters({
        content: content
      });
    } else {
      throw `Must override generateEncryptionParameters to handle format ${format}.`;
    }
  }

  async generateDecryptedParameters({ encryptedParameters, key }) {
    if (!encryptedParameters.isEncryptionParameters) {
      throw 'Atempting to generate decrypted parameters from non-parameters object.';
    }

    const format = encryptedParameters.getContentFormat();
    if (format === PayloadFormats.DecryptedBareObject) {
      /** No decryption required */
      return CreateEncryptionParameters(encryptedParameters);
    }
    else if (format === PayloadFormats.DecryptedBase64String) {
      const contentString = encryptedParameters.content.substring(
        ProtocolVersions.VersionLength,
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

  encryptionPayloadType({ item, key, intent }) {
    let encrypt = !isNullOrUndefined(key);
    if (item.doNotEncrypt()) {
      /** doNotEncrypt should only be respected for sync intent */
      encrypt = intent === EncryptionIntents.Sync;
    }

    if (encrypt) {
      return PayloadFormats.EncryptedString;
    } else {
      if (intent === EncryptionIntents.Sync) {
        return PayloadFormats.DecryptedBase64String;
      } else {
        return PayloadFormats.DecryptedBareObject;
      }
    }
  }
}

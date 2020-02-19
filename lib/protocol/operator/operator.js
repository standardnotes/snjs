import { SNItemsKey } from '@Models/app/items_key';
import { PayloadFormats } from '@Payloads/formats';
import { 
  CreateEncryptionParameters, 
  CopyEncryptionParameters, 
  CreateMaxPayloadFromAnyObject 
} from '@Payloads/generator';
import { ProtocolVersions } from '@Protocol/versions';
import { base64Encode, base64Decode } from 'sncrypto';

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
      const base64String = await base64Encode(jsonString);
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
        const jsonString = await base64Decode(contentString);
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
}

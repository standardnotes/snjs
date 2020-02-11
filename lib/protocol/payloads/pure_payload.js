import { ProtocolVersions } from '@Protocol/versions';
import { isNullOrUndefined, isString, isObject } from '@Lib/utils';
import { CopyPayload } from '@Payloads/generator';
import { PayloadFormats } from '@Payloads/formats';

export class PurePayload {

  constructor(rawPayload, isFromGenerator) {
    if(rawPayload.isItem) {
      throw 'Cannot create payload from item directly';
    }
    if(!isFromGenerator) {
      throw 'Do not construct payloads directly. Use generator functions';
    }
    /** Set all required fields on our instance of payload */
    for(const field of this.constructor.fields()) {
      const value = rawPayload[field];
      if(!isNullOrUndefined(value)) {
        this[field] = value;
      }
    }
    /** Keep unmodified values as existing on item */
    /**
    if(item.errorDecrypting) {
      if(encryptionPayload) {
        throw 'Should not feed custom encryption payload if the object was not decrypted.';
      }
      this.content = item.content;
      this.enc_item_key = item.enc_item_key;
      if(item.auth_hash) {
        this.auth_hash = item.auth_hash;
      }
    }
    */
  }

  mergedWith(otherPayload) {
    return CopyPayload({
      payload: this,
      override: otherPayload
    });
  }

  fields() {
    return this.constructor.fields();
  }

  static fields() {
    throw 'Must override PurePayload.fields';
  }

  get version() {
    if(isString(this.content)) {
      return this.content.substring(0, ProtocolVersions.VersionLength);
    } else {
      return this.content.version;
    }
  }

  getFormat() {
    if(isString(this.content)) {
      if (this.content.startsWith(ProtocolVersions.V000Base64Decrypted)) {
        return PayloadFormats.DecryptedBase64String;
      } else {
        return PayloadFormats.EncryptedString;
      }
    } else if(isObject(this.content)) {
      return PayloadFormats.DecryptedBareObject;
    } else {
      throw 'Unhandle content format for payload.getFormat()';
    }
  }

  /** Allows consumers to check if object they are inspecting is a generic object or an actual payload */
  get isPayload() {
    return true;
  }
}

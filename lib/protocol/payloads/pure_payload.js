import { PROTOCOL_VERSION_LENGTH } from '@Protocol/versions';
import { isNullOrUndefined } from '@Lib/utils';

export class SNPurePayload {

  constructor(rawPayload, isFromGenerator) {
    if(rawPayload.isItem) {
      throw 'Cannot create payload from item directly';
    }
    if(!isFromGenerator) {
      throw 'Do not construct payloads directly. Use generator functions';
    }
    const payloadCopy = JSON.parse(JSON.stringify(rawPayload));
    /** Set all required fields on our instance of payload */
    for(const field of this.constructor.fields()) {
      const value = payloadCopy[field];
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

  static fields() {
    throw 'Must override SNPurePayload.fields';
  }

  get version() {
    if(typeof this.content === 'string') {
      return this.content.substring(0, PROTOCOL_VERSION_LENGTH);
    } else {
      return this.content.version;
    }
  }

  /** Allows consumers to check if object they are inspecting is a generic object or an actual payload */
  get isPayload() {
    return true;
  }
}

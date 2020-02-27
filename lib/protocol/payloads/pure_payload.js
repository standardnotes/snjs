import { ProtocolVersions } from '@Protocol/versions';
import { isNullOrUndefined, isString, isObject } from '@Lib/utils';
import { CopyPayload } from '@Payloads/generator';
import { PayloadFormats } from '@Payloads/formats';

/**
 * A payload is a vehicle in which item data is transported or persisted.
 * This class represents an abstract PurePayload which does not have any fields. Instead,
 * subclasses must override the `fields` static method to return which fields this particular
 * class of payload contains. For example, a ServerItemPayload is a transmission vehicle for 
 * transporting an item to the server, and does not contain fields like PayloadFields.Dirty.
 * However, a StorageItemPayload is a persistence vehicle for saving payloads to disk, and does contain
 * PayloadsFields.Dirty.
 * 
 * Payloads are completely immutable and may not be modified after creation. Payloads should
 * not be created directly using the constructor, but instead created using the generators avaiable
 * in generator.js.
 * 
 * Payloads also have a content format. Formats can either be 
 * DecryptedBase64String, EncryptedString, or DecryptedBareObject.
 */
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

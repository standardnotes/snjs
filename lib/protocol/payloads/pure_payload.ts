import { PayloadOverride } from '@Payloads/override';
import { ProtocolVersions } from '@Protocol/versions';
import { isNullOrUndefined, isString, isObject } from '@Lib/utils';
import { CopyPayload } from '@Payloads/generator';
import { PayloadFormats } from '@Payloads/formats';
import { PayloadFields } from '@Payloads/fields';

export type RawPayload = {
  [key: string]: any
}

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
  [index: string]: any;

  constructor(rawPayload: RawPayload, isFromGenerator: boolean) {
    if (!isFromGenerator) {
      throw 'Do not construct payloads directly. Use generator functions';
    }
    /** Set all required fields on our instance of payload */
    for (const field of this.fields()) {
      const value = rawPayload[field];
      if (!isNullOrUndefined(value)) {
        this[field] = value;
      }
    }
  }

  mergedWith(otherPayload: PurePayload) {
    return CopyPayload(
      this,
      otherPayload as PayloadOverride
    );
  }

  fields() {
    return (this.constructor as typeof PurePayload).fields();
  }

  static fields() : Array<PayloadFields> {
    throw 'Must override PurePayload.fields';
  }

  getField(field: PayloadFields) {
    return this[field] as PayloadFields;
  }

  get version() {
    if (isString(this.content)) {
      return this.content.substring(0, ProtocolVersions.VersionLength);
    } else {
      return this.content.version;
    }
  }

  getFormat() {
    if (isString(this.content)) {
      if (this.content.startsWith(ProtocolVersions.V000Base64Decrypted)) {
        return PayloadFormats.DecryptedBase64String;
      } else {
        return PayloadFormats.EncryptedString;
      }
    } else if (isObject(this.content)) {
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

import { PayloadFields } from '@Payloads/index';
import { ContentType } from '@Models/content_types';
import { CreateItemFromPayload } from '@Models/generator';
import { ProtocolVersion } from '@Protocol/versions';
import { isNullOrUndefined, isString, isObject, Copy, deepFreeze } from '@Lib/utils';
import { CopyPayload, PayloadOverride, RawPayload, PayloadContent } from '@Payloads/generator';
import { PayloadFormat } from '@Payloads/formats';

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
  /** When constructed, the payload takes in an array of fields that the input raw payload
   * contains. These fields allow consumers to determine whether a given payload has an actual
   * undefined value for payload.content, for example, or whether the payload was constructed
   * to omit that field altogether (as in the case of server saved payloads) */
  readonly fields: PayloadFields[]
  readonly uuid?: string
  readonly content_type?: ContentType
  readonly content?: PayloadContent | string
  readonly deleted?: boolean
  readonly items_key_id?: string
  readonly enc_item_key?: string
  readonly created_at?: Date
  readonly updated_at?: Date
  readonly dirtiedDate?: Date
  readonly dirty?: boolean
  readonly dummy?: boolean
  readonly errorDecrypting?: boolean
  readonly waitingForKey?: boolean
  readonly errorDecryptingValueChanged?: boolean
  readonly lastSyncBegan?: Date
  readonly lastSyncEnd?: Date
  /** @deprecated */
  readonly auth_hash?: string
  /** @deprecated */
  readonly auth_params?: any

  readonly format: PayloadFormat
  readonly version?: ProtocolVersion

  constructor(rawPayload: RawPayload, fields: PayloadFields[]) {
    this.fields = fields;
    this.uuid = rawPayload.uuid;
    this.content_type = rawPayload.content_type;
    this.content = rawPayload.content;
    this.deleted = rawPayload.deleted;
    this.items_key_id = rawPayload.items_key_id;
    this.enc_item_key = rawPayload.enc_item_key;
    this.created_at = rawPayload.created_at;
    this.updated_at = rawPayload.updated_at;
    this.dirtiedDate = rawPayload.dirtiedDate;
    this.dirty = rawPayload.dirty;
    this.dummy = rawPayload.dummy;
    this.errorDecrypting = rawPayload.errorDecrypting;
    this.waitingForKey = rawPayload.waitingForKey;
    this.errorDecryptingValueChanged = rawPayload.errorDecryptingValueChanged;
    this.lastSyncBegan = rawPayload.lastSyncBegan;
    this.lastSyncEnd = rawPayload.lastSyncEnd;
    this.auth_hash = rawPayload.auth_hash;
    this.auth_params = rawPayload.auth_params;
    if (isString(this.content)) {
      if ((this.content as string).startsWith(ProtocolVersion.V000Base64Decrypted)) {
        this.format = PayloadFormat.DecryptedBase64String;
      } else {
        this.format = PayloadFormat.EncryptedString;
      }
    } else if (isObject(this.content)) {
      this.format = PayloadFormat.DecryptedBareObject;
    } else {
      this.format = PayloadFormat.Deleted;
    }
    if (isString(this.content)) {
      this.version = (this.content as string).substring(
        0,
        ProtocolVersion.VersionLength
      ) as ProtocolVersion;
    } else if(this.content){
      this.version = (this.content as PayloadContent).version;
    }
    // deepFreeze(this);
  }

  get decoded() {
    return this.format === PayloadFormat.DecryptedBareObject;
  }

  get encoded() {
    return (
      this.format === PayloadFormat.EncryptedString ||
      this.format === PayloadFormat.DecryptedBase64String
    );
  }

  get contentObject() {
    if(this.format !== PayloadFormat.DecryptedBareObject) {
      debugger;
      throw Error('Attempting to access non-object content as object');
    }
    return this.content as PayloadContent;
  }

  get contentString() {
    if (this.format === PayloadFormat.DecryptedBareObject) {
      throw Error('Attempting to access non-string content as string');
    }
    return this.content as string;
  }

  mergedWith(otherPayload: PurePayload) {
    return CopyPayload(
      this,
      otherPayload as PayloadOverride
    );
  }

  /**
   * Whether a payload can be discarded and removed from storage.
   * This value is true if a payload is marked as deleted and not dirty.
   */
  get discardable() {
    return this.deleted && !this.dirty;
  }

  /**
   * Compares the .content fields for equality, creating new SNItem objects
   * to properly handle .content intricacies.
   */
  compareContentFields(otherPayload: PurePayload) {
    const left = CreateItemFromPayload(this);
    const right = CreateItemFromPayload(otherPayload);
    return left.isItemContentEqualWith(right);
  }
}

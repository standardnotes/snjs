import { PurePayload } from '@Payloads/pure_payload';
import { ProtocolVersions } from '@Protocol';
import { SFItem } from '@Models';

export class SNPureItemPayload extends PurePayload {

  static fields() {
    throw 'Must override SNPureItemPayload.fields';
  }

  get version() {
    return this.content.substring(0, ProtocolVersions.VersionLength);
  }

  /**
   * Whether a payload can be discarded and removed from storage.
   * This value is true if a payload is marked as deleted and not dirty.
   */
  get discardable() {
    return this.deleted && !this.dirty;
  }

  /**
   * Compares the .content fields for equality, creating new SFItem objects
   * to properly handle .content intricacies.
   */
  compareContentFields(otherPayload) {
    const left = new SFItem(this);
    const right = new SFItem(otherPayload);
    return left.isItemContentEqualWith(right);
  }
}

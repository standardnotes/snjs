import { CreateItemFromPayload } from '@Models/generator';
import { PurePayload } from '@Payloads/pure_payload';
import { ProtocolVersions } from '@Protocol/versions';
import { SNItem } from '@Models/core/item';

export class SNPureItemPayload extends PurePayload {

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
   * Compares the .content fields for equality, creating new SNItem objects
   * to properly handle .content intricacies.
   */
  compareContentFields(otherPayload: SNPureItemPayload) {
    const left = CreateItemFromPayload(this);
    const right = CreateItemFromPayload(otherPayload);
    return left.isItemContentEqualWith(right);
  }
}

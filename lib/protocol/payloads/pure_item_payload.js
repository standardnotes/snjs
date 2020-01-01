import { SNPurePayload } from '@Protocol/payloads/pure_payload';
import { PROTOCOL_VERSION_LENGTH } from '@Protocol/versions';
import { SFItem } from '@Models/core/item';
import pick from 'lodash/pick';

export class SNPureItemPayload extends SNPurePayload {

  static fields() {
    throw 'Must override SNPureItemPayload.fields';
  }

  get version() {
    return this.content.substring(0, PROTOCOL_VERSION_LENGTH);
  }

  /**
   * Copies this payload and assigns it a new uuid.
   */
  async copyWithNewId({isConflict}) {
    const override = {
      uuid: await SFItem.GenerateUuid()
    }
    if(isConflict) {
      override.content = {conflict_of: this.uuid};
    }
    const copy = CreatePayloadFromAnyObject({
      object: this,
      override: override
    })
    return copy;
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

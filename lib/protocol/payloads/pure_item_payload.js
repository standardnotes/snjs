import { SNPurePayload } from '@Protocol/payloads/pure_payload';
import { PROTOCOL_VERSION_LENGTH } from '@Protocol/versions';
import { SFItem } from '@Models/core/item';
import { extendArray } from '@Lib/utils';
import remove from 'lodash/remove';

export class SNPureItemPayload extends SNPurePayload {

  static fields() {
    throw 'Must override SNPureItemPayload.fields';
  }

  get version() {
    return this.content.substring(0, PROTOCOL_VERSION_LENGTH);
  }

  /**
   * Copies this payload and assigns it a new uuid.
   * @returns An array of payloads that have changed as a result of copying.
   */
  async payloadsByCopying({isConflict, masterCollection} = {}) {
    const results = [];
    const override = {
      uuid: await SFItem.GenerateUuid(),
      dirty: true
    }
    if(isConflict) {
      override.content = {conflict_of: this.uuid};
    }
    const copy = CreatePayloadFromAnyObject({
      object: this,
      override: override
    })

    results.push(copy);

    /**
     * Get the payloads that make reference to us (this) and add the copy.
     */
    const referencing = masterCollection.payloadsThatReferencePayload(this);
    const updatedReferencing = this.constructor.PayloadsByUpdatingReferences({
      payloads: referencing,
      add: [{
        uuid: copy.uuid,
        content_type: copy.content_type
      }]
    })
    extendArray(results, updatedReferencing);
    return results;
  }

  /**
   * Return the payloads that result if you alternated the uuid for the instance payload.
   * Alternating a UUID involves instructing related items to drop old references of a uuid
   * for the new one.
   * @returns An array of payloads that have changed as a result of copying.
   */
  async payloadsByAlternatingUuid({masterCollection}) {
    const results = [];
    /**
    * We need to clone this item and give it a new uuid,
    * then delete item with old uuid from db (cannot modify uuids in our IndexedDB setup)
    */
    const copy = CreatePayloadFromAnyObject({
      object: this,
      override: {
        uuid: await SFItem.GenerateUuid(),
        dirty: true
      }
    })

    results.push(copy);

    /**
     * Get the payloads that make reference to us (this) and remove
     * us as a relationship, instead adding the new copy.
     */
    const referencing = masterCollection.payloadsThatReferencePayload(this);
    const updatedReferencing = this.constructor.PayloadsByUpdatingReferences({
      payloads: referencing,
      add: [{
        uuid: copy.uuid,
        content_type: copy.content_type
      }],
      removeIds: [
       this.uuid
      ]
    })

    extendArray(results, updatedReferencing);

    const updatedSelf = CreatePayloadFromAnyObject({
      object: this,
      override: {
        deleted: true,
        content: {
          references: []
        }
      }
    })

    results.push(updatedSelf);
    return results;
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

  /**
   * @private
   */


  static PayloadsByUpdatingReferences({payloads, add, removeIds}) {
   const results = [];
   for(const payload of payloads) {
     const references = payload.content.references.slice();
     if(add) {
       for(const reference of add) {
         references.push(reference);
       }
     }
     if(removeIds) {
       for(const id of removeIds) {
         remove(references, {uuid: id});
       }
     }
     const result = CreatePayloadFromAnyObject({
       object: payload,
       override: {
         dirty: true,
         content: {
           references: references
         }
       }
     });
     results.push(result);
   }
   return results;
  }
}

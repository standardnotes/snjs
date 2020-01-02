import { SNPurePayload } from '@Protocol/payloads/pure_payload';
import { PROTOCOL_VERSION_LENGTH } from '@Protocol/versions';
import { SFItem } from '@Models/core/item';
import { extendArray } from '@Lib/utils';

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
      uuid: await SFItem.GenerateUuid()
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
    const referencing = masterCollection.payloadsThatReferencePaylod(this);
    const updatedReferencing = this.payloadsByUpdatingReferences({
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
        uuid: await SFItem.GenerateUuid()
      }
    })

    results.push(copy);

    /**
     * Get the payloads that make reference to us (this) and remove
     * us as a relationship, instead adding the new copy.
     */
    const referencing = masterCollection.payloadsThatReferencePaylod(this);
    const updatedReferencing = this.payloadsByUpdatingReferences({
      payloads: referencing,
      add: [{
        uuid: copy.uuid,
        content_type: copy.content_type
      }],
      remove: [
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


   payloadsByUpdatingReferences({payloads, add, remove}) {
     const results = [];
     for(const payload of payloads) {
       const references = payloads.content.references.slice();
       for(const reference of add) {
         references.push(reference);
       }
       for(const id of remove) {
         remove(references, {uuid: id});
       }
       const result = CreatePayloadFromAnyObject({
         object: referencingPayload,
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

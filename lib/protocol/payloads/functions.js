import { SFItem } from '@Models/core/item';
/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByCopying({payload, baseCollection, isConflict}) {
  const results = [];
  const override = {
    uuid: await SFItem.GenerateUuid(),
    dirty: true
  }
  if(isConflict) {
    override.content = {
      conflict_of: payload.uuid
    };
  }
  const copy = CreatePayloadFromAnyObject({
    object: payload,
    override: override
  })

  results.push(copy);

  /**
   * Get the payloads that make reference to payload and add the copy.
   */
  const referencing = baseCollection.payloadsThatReferencePayload(payload);
  const updatedReferencing = await PayloadsByUpdatingReferences({
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
export async function PayloadsByAlternatingUuid({payload, baseCollection}) {
  const results = [];
  /**
  * We need to clone payload and give it a new uuid,
  * then delete item with old uuid from db (cannot modify uuids in our IndexedDB setup)
  */
  const copy = CreatePayloadFromAnyObject({
    object: payload,
    override: {
      uuid: await SFItem.GenerateUuid(),
      dirty: true
    }
  })

  results.push(copy);

  /**
   * Get the payloads that make reference to payload and remove
   * us as a relationship, instead adding the new copy.
   */
  const referencing = baseCollection.payloadsThatReferencePayload(payload);
  const updatedReferencing = await PayloadsByUpdatingReferences({
    payloads: referencing,
    add: [{
      uuid: copy.uuid,
      content_type: copy.content_type
    }],
    removeIds: [
     payload.uuid
    ]
  })

  extendArray(results, updatedReferencing);

  const updatedSelf = CreatePayloadFromAnyObject({
    object: payload,
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

async function PayloadsByUpdatingReferences({payloads, add, removeIds}) {
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

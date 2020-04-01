import { ContentReference } from './generator';
import { PayloadCollection } from '@Payloads/collection';
import { CreateItemFromPayload } from '@Models/generator';
import remove from 'lodash/remove';
import { CopyPayload, PayloadOverride } from '@Payloads/generator';
import { extendArray } from '@Lib/utils';
import { Uuid } from '@Lib/uuid';
import { PurePayload } from '@Payloads/pure_payload';

export function PayloadContentsEqual(payloadA: PurePayload, payloadB: PurePayload) {
  const itemA = CreateItemFromPayload(payloadA);
  const itemB = CreateItemFromPayload(payloadB);
  return itemA.isItemContentEqualWith(itemB);
}

/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByDuplicating(
  payload: PurePayload,
  baseCollection: PayloadCollection,
  isConflict: boolean
) {
  const results = [];
  const override: PayloadOverride = {
    uuid: await Uuid.GenerateUuid(),
    dirty: true,
    dirtiedDate: null,
    lastSyncBegan: null,
    lastSyncEnd: null,
  };
  if (isConflict) {
    override.content = {
      conflict_of: payload.uuid
    };
  }
  const copy = CopyPayload(
    payload,
    override
  );

  results.push(copy);

  /**
   * Get the payloads that make reference to payload and add the copy.
   */
  const referencing = baseCollection.payloadsThatReferencePayload(payload);
  const updatedReferencing = await PayloadsByUpdatingReferences(
    referencing,
    [{
      uuid: copy.uuid!,
      content_type: copy.content_type!
    }]
  );
  extendArray(results, updatedReferencing);
  return results;
}

/**
 * Return the payloads that result if you alternated the uuid for the payload.
 * Alternating a UUID involves instructing related items to drop old references of a uuid
 * for the new one.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByAlternatingUuid(
  payload: PurePayload,
  baseCollection: PayloadCollection
) {
  const results = [];
  /**
  * We need to clone payload and give it a new uuid,
  * then delete item with old uuid from db (cannot modify uuids in our IndexedDB setup)
  */
  const copy = CopyPayload(
    payload,
    {
      uuid: await Uuid.GenerateUuid(),
      dirty: true
    }
  );

  results.push(copy);

  /**
   * Get the payloads that make reference to payload and remove
   * payload as a relationship, instead adding the new copy.
   */
  const referencing = baseCollection.payloadsThatReferencePayload(payload);
  const updatedReferencing = await PayloadsByUpdatingReferences(
    referencing,
    [{
      uuid: copy.uuid!,
      content_type: copy.content_type!
    }],
    [payload.uuid!]
  );

  extendArray(results, updatedReferencing);

  const updatedSelf = CopyPayload(
    payload,
    {
      deleted: true,
      /** Do not set as dirty; this item is non-syncable
        and should be immediately discarded */
      dirty: false,
      content: {
        references: []
      }
    }
  );

  results.push(updatedSelf);
  return results;
}

async function PayloadsByUpdatingReferences(
  payloads: PurePayload[],
  add: ContentReference[],
  removeIds?: string[]
) {
  const results = [];
  for (const payload of payloads) {
    const references = payload.contentObject.references.slice();
    if (add) {
      for (const reference of add) {
        references.push(reference);
      }
    }
    if (removeIds) {
      for (const id of removeIds) {
        remove(references, { uuid: id });
      }
    }
    const result = CopyPayload(
      payload,
      {
        dirty: true,
        content: {
          references: references
        }
      }
    );
    results.push(result);
  }
  return results;
}

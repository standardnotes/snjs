import { MutationType } from './../../models/core/item';
import { SNComponent, ComponentArea, ComponentMutator } from './../../models/app/component';
import { ContentReference } from './generator';
import { ImmutablePayloadCollection } from "@Protocol/collection/payload_collection";
import { CreateItemFromPayload } from '@Models/generator';
import remove from 'lodash/remove';
import { CopyPayload, PayloadOverride } from '@Payloads/generator';
import { extendArray } from '@Lib/utils';
import { Uuid } from '@Lib/uuid';
import { PurePayload } from '@Payloads/pure_payload';
import { ContentType } from '@Lib/models';

type AffectorFunction = (
  basePayload: PurePayload,
  duplicatePayload: PurePayload,
  baseCollection: ImmutablePayloadCollection
) => PurePayload[]

function NoteDuplicationAffectedPayloads(
  basePayload: PurePayload,
  duplicatePayload: PurePayload,
  baseCollection: ImmutablePayloadCollection
) {
  /** If note has editor, maintain editor relationship in duplicate note */
  const components = baseCollection.all(ContentType.Component).map((payload) => {
    return CreateItemFromPayload(payload);
  }) as SNComponent[];
  const editor = components.filter((c) => c.area === ComponentArea.Editor).find((e) => {
    return e.isExplicitlyEnabledForItem(basePayload.uuid);
  })
  if (!editor) {
    return undefined;
  }
  /** Modify the editor to include new note */
  const mutator = new ComponentMutator(editor, MutationType.Internal);
  mutator.associateWithItem(duplicatePayload.uuid);
  const result = mutator.getResult();
  return [result];
}

const AffectorMapping = {
  [ContentType.Note]: NoteDuplicationAffectedPayloads
} as Partial<Record<ContentType, AffectorFunction>>

/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByDuplicating(
  payload: PurePayload,
  baseCollection: ImmutablePayloadCollection,
  isConflict: boolean
) {
  const results = [];
  const override: PayloadOverride = {
    uuid: await Uuid.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: null,
    lastSyncEnd: null,
    duplicate_of: payload.uuid,
  };
  if (isConflict) {
    override.content = {
      ...payload.safeContent,
      conflict_of: payload.uuid,
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
  const referencing = baseCollection.elementsReferencingElement(payload);
  const updatedReferencing = await PayloadsByUpdatingReferences(
    referencing,
    [{
      uuid: copy.uuid!,
      content_type: copy.content_type!
    }]
  );
  extendArray(results, updatedReferencing);

  const affector = AffectorMapping[payload.content_type];
  if (affector) {
    const affected = affector(payload, copy, baseCollection);
    if(affected) {
      extendArray(results, affected);
    }
  }

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
  baseCollection: ImmutablePayloadCollection
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
      dirty: true,
      dirtiedDate: new Date(),
      lastSyncBegan: null,
      lastSyncEnd: null,
    }
  );

  results.push(copy);

  /**
   * Get the payloads that make reference to payload and remove
   * payload as a relationship, instead adding the new copy.
   */
  const referencing = baseCollection.elementsReferencingElement(payload);
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
      content: undefined
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
        dirtiedDate: new Date(),
        content: {
          ...payload.safeContent,
          references: references
        }
      }
    );
    results.push(result);
  }
  return results;
}

/**
 * Compares the .content fields for equality, creating new SNItem objects
 * to properly handle .content intricacies.
 */
export function PayloadContentsEqual(payloadA: PurePayload, payloadB: PurePayload) {
  const itemA = CreateItemFromPayload(payloadA);
  const itemB = CreateItemFromPayload(payloadB);
  return itemA.isItemContentEqualWith(itemB);
}
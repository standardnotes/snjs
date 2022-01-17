import { extendArray } from '@Lib/utils';
import { Uuid } from '@Lib/uuid';
import { CreateItemFromPayload } from '@Models/generator';
import { CopyPayload, PayloadOverride } from '@Payloads/generator';
import { PurePayload } from '@Payloads/pure_payload';
import { ImmutablePayloadCollection } from '@Protocol/collection/payload_collection';
import { ContentType } from '@standardnotes/common';
import {
  ComponentArea,
  ComponentMutator,
  SNComponent,
} from './../../models/app/component';
import { MutationType } from './../../models/core/item';
import { ContentReference, PayloadContent } from './generator';

type AffectorFunction = (
  basePayload: PurePayload,
  duplicatePayload: PurePayload,
  baseCollection: ImmutablePayloadCollection
) => PurePayload[];

function NoteDuplicationAffectedPayloads(
  basePayload: PurePayload,
  duplicatePayload: PurePayload,
  baseCollection: ImmutablePayloadCollection
) {
  /** If note has editor, maintain editor relationship in duplicate note */
  const components = baseCollection
    .all(ContentType.Component)
    .map((payload) => {
      return CreateItemFromPayload(payload);
    }) as SNComponent[];
  const editor = components
    .filter((c) => c.area === ComponentArea.Editor)
    .find((e) => {
      return e.isExplicitlyEnabledForItem(basePayload.uuid);
    });
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
  [ContentType.Note]: NoteDuplicationAffectedPayloads,
} as Partial<Record<ContentType, AffectorFunction>>;

/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByDuplicating(
  payload: PurePayload,
  baseCollection: ImmutablePayloadCollection,
  isConflict: boolean,
  additionalContent?: Partial<PayloadContent>
): Promise<PurePayload[]> {
  if (payload.errorDecrypting) {
    throw Error('Attempting to duplicate errored payload');
  }
  const results = [];
  const override: PayloadOverride = {
    uuid: await Uuid.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: null,
    lastSyncEnd: null,
    duplicate_of: payload.uuid,
  };
  override.content = {
    ...payload.safeContent,
    ...additionalContent,
  };
  if (isConflict) {
    override.content.conflict_of = payload.uuid;
  }
  const copy = CopyPayload(payload, override);

  results.push(copy);

  const updated = DuplicatePayloadsReferencesToANewCopy(
    payload,
    copy,
    baseCollection
  );
  extendArray(results, updated);

  const affector = AffectorMapping[payload.content_type];
  if (affector) {
    const affected = affector(payload, copy, baseCollection);
    if (affected) {
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
): Promise<PurePayload[]> {
  const results: PurePayload[] = [];
  /**
   * We need to clone payload and give it a new uuid,
   * then delete item with old uuid from db (cannot modify uuids in our IndexedDB setup)
   */
  const copy = CopyPayload(payload, {
    uuid: await Uuid.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: null,
    lastSyncEnd: null,
    duplicate_of: payload.uuid,
  });
  results.push(copy);

  const updated = ReplacePayloadsReferencesByANewCopy(
    payload,
    copy,
    baseCollection
  );
  extendArray(results, updated);

  if (payload.content_type === ContentType.ItemsKey) {
    /**
     * Update any payloads who are still encrypted and whose items_key_id point to this uuid
     */
    const matchingPayloads = baseCollection
      .all()
      .filter((p) => p.items_key_id === payload.uuid);
    const adjustedPayloads = matchingPayloads.map((a) =>
      CopyPayload(a, { items_key_id: copy.uuid })
    );
    if (adjustedPayloads.length > 0) {
      extendArray(results, adjustedPayloads);
    }
  }

  const updatedSelf = CopyPayload(payload, {
    deleted: true,
    /** Do not set as dirty; this item is non-syncable
        and should be immediately discarded */
    dirty: false,
    content: undefined,
  });

  results.push(updatedSelf);
  return results;
}

const ReplacePayloadReferencesByANewTemplate = (
  payload: PurePayload,
  replacedPayloadUuid: string,
  newReferenceTemplate: Partial<ContentReference>
): PurePayload => {
  const newReferences = payload.references.map((ref) => {
    if (ref.uuid === replacedPayloadUuid) {
      return { ...ref, ...newReferenceTemplate };
    }
    return ref;
  });

  const result = CopyPayload(payload, {
    dirty: true,
    dirtiedDate: new Date(),
    content: {
      ...payload.safeContent,
      references: newReferences,
    },
  });

  return result;
};

const ReplacePayloadsReferencesByANewCopy = (
  payload: PurePayload,
  copy: PurePayload,
  baseCollection: ImmutablePayloadCollection
): PurePayload[] => {
  const referenceTemplate: Partial<ContentReference> = {
    uuid: copy.uuid,
    content_type: copy.content_type,
  };
  const referencing = baseCollection.elementsReferencingElement(payload);

  const result = referencing.map((referencingPayload) => {
    return ReplacePayloadReferencesByANewTemplate(
      referencingPayload,
      payload.uuid,
      referenceTemplate
    );
  });

  return result;
};

const DuplicatePayloadReferenceToANewTemplate = (
  payload: PurePayload,
  duplicatedPayloadUuid: string,
  newReferenceTemplate: Partial<ContentReference>
): PurePayload => {
  const referencesWeAreDuplicating = payload.references.filter(
    (ref) => ref.uuid === duplicatedPayloadUuid
  );

  const duplicatedReferenceWithNewPayload = referencesWeAreDuplicating.map(
    (ref) => {
      return { ...ref, ...newReferenceTemplate };
    }
  );

  const newReferences = payload.references.concat(
    duplicatedReferenceWithNewPayload
  );

  const result = CopyPayload(payload, {
    dirty: true,
    dirtiedDate: new Date(),
    content: {
      ...payload.safeContent,
      references: newReferences,
    },
  });

  return result;
};

const DuplicatePayloadsReferencesToANewCopy = (
  payload: PurePayload,
  copy: PurePayload,
  baseCollection: ImmutablePayloadCollection
): PurePayload[] => {
  const referenceTemplate: Partial<ContentReference> = {
    uuid: copy.uuid,
    content_type: copy.content_type,
  };
  const referencing = baseCollection.elementsReferencingElement(payload);

  const result = referencing.map((referencingPayload) => {
    return DuplicatePayloadReferenceToANewTemplate(
      referencingPayload,
      payload.uuid,
      referenceTemplate
    );
  });

  return result;
};

/**
 * Compares the .content fields for equality, creating new SNItem objects
 * to properly handle .content intricacies.
 */
export function PayloadContentsEqual(
  payloadA: PurePayload,
  payloadB: PurePayload
): boolean {
  const itemA = CreateItemFromPayload(payloadA);
  const itemB = CreateItemFromPayload(payloadB);
  return itemA.isItemContentEqualWith(itemB);
}

import {
  PayloadInterface,
  ImmutablePayloadCollection,
  PurePayload,
  AffectorFunction,
  CopyPayload,
  PayloadsByUpdatingReferencingPayloadReferences,
  PayloadOverride,
  PayloadContent,
} from '@standardnotes/payloads'

import { CreateItemFromPayload } from '@Lib/Models/Generator'
import { ContentType } from '@standardnotes/common'
import { UuidGenerator, extendArray } from '@standardnotes/utils'
import { SNComponent } from '../../Models/Component/Component'
import { ComponentMutator } from '../../Models/Component/ComponentMutator'
import { ComponentArea } from '@standardnotes/features'
import { MutationType } from '../../Models/Item/MutationType'

function NoteDuplicationAffectedPayloads(
  basePayload: PurePayload,
  duplicatePayload: PurePayload,
  baseCollection: ImmutablePayloadCollection,
) {
  /** If note has editor, maintain editor relationship in duplicate note */
  const components = baseCollection.all(ContentType.Component).map((payload) => {
    return CreateItemFromPayload(payload)
  }) as SNComponent[]
  const editor = components
    .filter((c) => c.area === ComponentArea.Editor)
    .find((e) => {
      return e.isExplicitlyEnabledForItem(basePayload.uuid)
    })
  if (!editor) {
    return undefined
  }
  /** Modify the editor to include new note */
  const mutator = new ComponentMutator(editor, MutationType.NoUpdateUserTimestamps)
  mutator.associateWithItem(duplicatePayload.uuid)
  const result = mutator.getResult()
  return [result]
}

const AffectorMapping = {
  [ContentType.Note]: NoteDuplicationAffectedPayloads,
} as Partial<Record<ContentType, AffectorFunction>>

/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByDuplicating(
  payload: PayloadInterface,
  baseCollection: ImmutablePayloadCollection,
  isConflict: boolean,
  additionalContent?: Partial<PayloadContent>,
): Promise<PayloadInterface[]> {
  if (payload.errorDecrypting) {
    throw Error('Attempting to duplicate errored payload')
  }
  const results = []
  const override: PayloadOverride = {
    uuid: await UuidGenerator.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: null,
    lastSyncEnd: null,
    duplicate_of: payload.uuid,
  }
  override.content = {
    ...payload.safeContent,
    ...additionalContent,
  }
  if (isConflict) {
    override.content.conflict_of = payload.uuid
  }
  const copy = CopyPayload(payload, override)

  results.push(copy)

  /**
   * Get the payloads that make reference to payload and add the copy.
   */
  const updatedReferencing = PayloadsByUpdatingReferencingPayloadReferences(
    payload,
    baseCollection,
    [copy],
  )
  extendArray(results, updatedReferencing)

  const affector = AffectorMapping[payload.content_type as ContentType]
  if (affector) {
    const affected = affector(payload, copy, baseCollection)
    if (affected) {
      extendArray(results, affected)
    }
  }

  return results
}

/**
 * Compares the .content fields for equality, creating new SNItem objects
 * to properly handle .content intricacies.
 */
export function PayloadContentsEqual(payloadA: PurePayload, payloadB: PurePayload): boolean {
  const itemA = CreateItemFromPayload(payloadA)
  const itemB = CreateItemFromPayload(payloadB)
  return itemA.isItemContentEqualWith(itemB)
}

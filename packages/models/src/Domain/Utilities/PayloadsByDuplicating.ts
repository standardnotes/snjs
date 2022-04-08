import { extendArray, UuidGenerator } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { ItemContent } from '../Abstract/Content/ItemContent'
import { AffectorMapping } from './AffectorFunction'
import { PayloadsByUpdatingReferencingPayloadReferences } from '../Abstract/Payload/Utilities/PayloadsByUpdatingReferencingPayloadReferences'
import { isDecryptedPayload } from '../Abstract/Payload/Interfaces/TypeCheck'
import { FullyFormedPayloadInterface } from '../Abstract/Payload/Interfaces/UnionTypes'
/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByDuplicating<C extends ItemContent = ItemContent>(
  payload: FullyFormedPayloadInterface<C>,
  baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
  isConflict: boolean,
  additionalContent?: Partial<C>,
): Promise<FullyFormedPayloadInterface[]> {
  const results: FullyFormedPayloadInterface[] = []

  const baseOverride = {
    uuid: UuidGenerator.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: undefined,
    lastSyncEnd: undefined,
    duplicate_of: payload.uuid,
  }

  let copy: FullyFormedPayloadInterface

  if (isDecryptedPayload(payload)) {
    const contentOverride: C = {
      ...payload.content,
      ...additionalContent,
    }

    if (isConflict) {
      contentOverride.conflict_of = payload.uuid
    }

    copy = payload.copy({
      ...baseOverride,
      content: contentOverride,
      deleted: false,
    })
  } else {
    copy = payload.copy({
      ...baseOverride,
    })
  }

  results.push(copy)

  if (isDecryptedPayload(payload) && isDecryptedPayload(copy)) {
    /**
     * Get the payloads that make reference to payload and add the copy.
     */
    const updatedReferencing = PayloadsByUpdatingReferencingPayloadReferences(
      payload,
      baseCollection,
      [copy],
    )
    extendArray(results, updatedReferencing)
  }

  const affector = AffectorMapping[payload.content_type]
  if (affector) {
    const affected = affector(payload, copy, baseCollection)
    if (affected) {
      extendArray(results, affected)
    }
  }

  return results
}

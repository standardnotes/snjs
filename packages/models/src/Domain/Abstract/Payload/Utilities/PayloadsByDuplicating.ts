import { ContentType } from '@standardnotes/common'
import { extendArray, UuidGenerator } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../../../Runtime/Collection/ImmutablePayloadCollection'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { ItemContent } from '../../Item/Interfaces/ItemContent'
import { AffectorMapping } from './AffectorFunction'
import { Writeable, CopyPayload, PayloadsByUpdatingReferencingPayloadReferences } from './Functions'

/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByDuplicating<C extends ItemContent = ItemContent>(
  payload: PayloadInterface<C>,
  baseCollection: ImmutablePayloadCollection,
  isConflict: boolean,
  additionalContent?: Partial<C>,
): Promise<PayloadInterface<C>[]> {
  if (payload.errorDecrypting) {
    throw Error('Attempting to duplicate errored payload')
  }

  const results: PayloadInterface<C>[] = []
  const override: Writeable<Partial<PayloadInterface<C>>> = {
    uuid: UuidGenerator.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: undefined,
    lastSyncEnd: undefined,
    duplicate_of: payload.uuid,
  }

  override.content = {
    ...payload.content,
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

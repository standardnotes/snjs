import { DecryptedPayloadInterface } from './../Interfaces/DecryptedPayload'
import { extendArray, UuidGenerator } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../../../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { ItemContent } from '../../Item/Interfaces/ItemContent'
import { AffectorMapping } from './AffectorFunction'
import { Writeable, CopyPayload, PayloadsByUpdatingReferencingPayloadReferences } from './Functions'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { isDecryptedPayload } from '../Interfaces/TypeCheck'

/**
 * Copies payload and assigns it a new uuid.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByDuplicating<C extends ItemContent = ItemContent>(
  payload: PayloadInterface,
  baseCollection: ImmutablePayloadCollection,
  isConflict: boolean,
  additionalContent?: Partial<C>,
): Promise<PayloadInterface[]> {
  const results: PayloadInterface[] = []

  const override: Writeable<Partial<PayloadInterface>> = {
    uuid: UuidGenerator.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: undefined,
    lastSyncEnd: undefined,
    duplicate_of: payload.uuid,
  }

  if (isDecryptedPayload(payload)) {
    const decryptedOverride = override as Writeable<DecryptedPayloadInterface>
    decryptedOverride.content = {
      ...payload.content,
      ...additionalContent,
    }

    if (isConflict) {
      decryptedOverride.content.conflict_of = payload.uuid
    }
  }

  const copy = CopyPayload(payload, override)
  results.push(copy)

  if (isDecryptedPayload(payload)) {
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

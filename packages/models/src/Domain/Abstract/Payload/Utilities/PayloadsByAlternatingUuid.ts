import { DeletedPayload } from './../Implementations/DeletedPayload'
import { ContentType } from '@standardnotes/common'
import { extendArray, UuidGenerator } from '@standardnotes/utils'
import { ImmutablePayloadCollection } from '../../../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { isEncryptedPayload } from '../Interfaces/TypeCheck'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { PayloadsByUpdatingReferencingPayloadReferences } from './Functions'

/**
 * Return the payloads that result if you alternated the uuid for the payload.
 * Alternating a UUID involves instructing related items to drop old references of a uuid
 * for the new one.
 * @returns An array of payloads that have changed as a result of copying.
 */

export async function PayloadsByAlternatingUuid(
  payload: DecryptedPayloadInterface,
  baseCollection: ImmutablePayloadCollection,
): Promise<PayloadInterface[]> {
  const results: PayloadInterface[] = []
  /**
   * We need to clone payload and give it a new uuid,
   * then delete item with old uuid from db (cannot modify uuids in our IndexedDB setup)
   */
  const copy = payload.copy({
    uuid: UuidGenerator.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: undefined,
    lastSyncEnd: undefined,
    duplicate_of: payload.uuid,
  })
  results.push(copy)

  /**
   * Get the payloads that make reference to payload and remove
   * payload as a relationship, instead adding the new copy.
   */
  const updatedReferencing = PayloadsByUpdatingReferencingPayloadReferences(
    payload,
    baseCollection,
    [copy],
    [payload.uuid],
  )
  extendArray(results, updatedReferencing)

  if (payload.content_type === ContentType.ItemsKey) {
    /**
     * Update any payloads who are still encrypted and whose items_key_id point to this uuid
     */
    const matchingPayloads = baseCollection
      .all()
      .filter(
        (p) => isEncryptedPayload(p) && p.items_key_id === payload.uuid,
      ) as EncryptedPayloadInterface[]

    const adjustedPayloads = matchingPayloads.map((a) => a.copy({ items_key_id: copy.uuid }))

    if (adjustedPayloads.length > 0) {
      extendArray(results, adjustedPayloads)
    }
  }

  const deletedSelf = new DeletedPayload(
    {
      /**
       * Do not set as dirty; this item is non-syncable
       * and should be immediately discarded
       */
      dirty: false,
      content: undefined,
      uuid: payload.uuid,
      content_type: payload.content_type,
      deleted: true,
    },
    payload.source,
  )
  results.push(deletedSelf)

  return results
}

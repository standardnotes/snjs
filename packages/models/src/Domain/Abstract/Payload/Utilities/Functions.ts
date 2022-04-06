import { EncryptedPayload } from './../Implementations/EncryptedPayload'
import { ContentlessPayload } from './../Implementations/ContentlessPayload'
import { DeletedPayload } from './../Implementations/DeletedPayload'
import { ContentType, Uuid } from '@standardnotes/common'
import { Copy, extendArray, UuidGenerator } from '@standardnotes/utils'
import { remove } from 'lodash'
import { ImmutablePayloadCollection } from '../../../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { ContentReference } from '../../Reference/ContentReference'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import { PayloadFormat } from '../Types/PayloadFormat'
import { ItemContent } from '../../Item/Interfaces/ItemContent'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { isEncryptedPayload } from '../Interfaces/TypeCheck'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { TransferPayload } from '../../TransferPayload/Interfaces/TransferPayload'
import { DecryptedPayload } from '../Implementations/DecryptedPayload'
import {
  isContentlessTransferPayload,
  isDecryptedTransferPayload,
  isDeletedTransferPayload,
  isEncryptedTransferPayload,
} from '../../TransferPayload/Interfaces/TypeCheck'

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

export function PayloadsByUpdatingReferencingPayloadReferences(
  payload: DecryptedPayloadInterface,
  baseCollection: ImmutablePayloadCollection,
  add: DecryptedPayloadInterface[] = [],
  removeIds: Uuid[] = [],
): DecryptedPayloadInterface[] {
  const referencingPayloads = baseCollection.elementsReferencingElement(payload)
  const results = []
  for (const referencingPayload of referencingPayloads) {
    const references = referencingPayload.content.references.slice()
    const reference = referencingPayload.getReference(payload.uuid)

    for (const addPayload of add) {
      const newReference: ContentReference = {
        ...reference,
        uuid: addPayload.uuid,
        content_type: addPayload.content_type,
      }
      references.push(newReference)
    }
    for (const id of removeIds) {
      remove(references, { uuid: id })
    }
    const result = referencingPayload.copy({
      dirty: true,
      dirtiedDate: new Date(),
      content: {
        ...referencingPayload.content,
        references,
      },
    })
    results.push(result)
  }
  return results
}

export function CreatePayload<T extends TransferPayload>(
  transferPayload: T,
  source: PayloadSource = PayloadSource.Constructor,
  override?: Partial<T>,
): PayloadInterface {
  const copy = Copy(transferPayload) as T
  const result: T = {
    ...copy,
    ...override,
  }

  if (isDeletedTransferPayload(result)) {
    return new DeletedPayload(result, source)
  } else if (isContentlessTransferPayload(result)) {
    return new ContentlessPayload(result, source)
  } else if (isEncryptedTransferPayload(result)) {
    return new EncryptedPayload(result, source)
  } else if (isDecryptedTransferPayload(result)) {
    return new DecryptedPayload(result, source)
  }

  throw Error('Unhandled case in CreatePayload')
}

export function CopyPayload<P extends PayloadInterface = PayloadInterface>(
  payload: P,
  override?: Partial<P>,
  source = payload.source,
): P {
  const result = CreatePayload(payload, source, override)
  return result as P
}

export function CopyPayloadWithContentOverride<C extends ItemContent = ItemContent>(
  payload: DecryptedPayloadInterface<C>,
  contentOverride: Partial<C>,
): DecryptedPayloadInterface<C> {
  const result = CreatePayload(payload, payload.source, {
    content: {
      ...payload.content,
      ...contentOverride,
    },
  })
  return result as DecryptedPayloadInterface<C>
}

/**
 * Whether the changed payload represents only an internal change that shouldn't
 * require a UI refresh
 */
export function isPayloadSourceInternalChange(source: PayloadSource): boolean {
  return [PayloadSource.RemoteSaved, PayloadSource.PreSyncSave].includes(source)
}

export function isPayloadSourceRetrieved(source: PayloadSource): boolean {
  return [
    PayloadSource.RemoteRetrieved,
    PayloadSource.ComponentRetrieved,
    PayloadSource.RemoteActionRetrieved,
  ].includes(source)
}

export function filterDisallowedRemotePayloads(payloads: PayloadInterface[]): PayloadInterface[] {
  return payloads.filter(isRemotePayloadAllowed)
}

export function isRemotePayloadAllowed(payload: PayloadInterface): boolean {
  if (payload.format === PayloadFormat.Deleted) {
    return (payload as EncryptedPayloadInterface).content == undefined
  }

  const acceptableFormats = [PayloadFormat.EncryptedString, PayloadFormat.MetadataOnly]

  return acceptableFormats.includes(payload.format)
}

export function SureFindPayload<P extends PayloadInterface = PayloadInterface>(
  uuid: Uuid,
  payloads: P[],
): P {
  return payloads.find((payload) => payload.uuid === uuid) as P
}

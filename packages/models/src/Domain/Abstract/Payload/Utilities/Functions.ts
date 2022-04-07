import { Uuid } from '@standardnotes/common'
import { remove } from 'lodash'
import { ImmutablePayloadCollection } from '../../../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { ContentReference } from '../../Reference/ContentReference'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import { PayloadFormat } from '../Types/PayloadFormat'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { ItemContent } from '../../Item'
import { ConcretePayload } from '../Interfaces/TypeCheck'

export function PayloadsByUpdatingReferencingPayloadReferences<
  C extends ItemContent = ItemContent,
  P extends DecryptedPayloadInterface<C> = DecryptedPayloadInterface<C>,
>(
  payload: P,
  baseCollection: ImmutablePayloadCollection<ConcretePayload>,
  add: P[] = [],
  removeIds: Uuid[] = [],
): P[] {
  const referencingPayloads = baseCollection.elementsReferencingElement(payload)
  const results: P[] = []

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

    results.push(result as P)
  }

  return results
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

import { Uuid } from '@standardnotes/common'
import { remove } from 'lodash'
import { ImmutablePayloadCollection } from '../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { ContentReference } from '../Abstract/Reference/ContentReference'
import { DecryptedPayloadInterface } from '../Abstract/Payload/Interfaces/DecryptedPayload'
import { ItemContent } from '../Abstract/Content/ItemContent'
import { FullyFormedPayloadInterface } from '../Abstract/Payload/Interfaces/UnionTypes'

export function PayloadsByUpdatingReferencingPayloadReferences<
  C extends ItemContent = ItemContent,
  P extends DecryptedPayloadInterface<C> = DecryptedPayloadInterface<C>,
>(
  payload: P,
  baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
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

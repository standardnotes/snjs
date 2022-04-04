import { EncryptedPayloadInterface } from '../../../Abstract/Payload/Interfaces/EncryptedPayload'
import { CollectionInterface } from '../CollectionInterface'
import { DecryptedPayloadInterface } from '../../../Abstract/Payload/Interfaces/DecryptedPayload'
import { isString, UuidMap } from '@standardnotes/utils'
import { ContentType, Uuid } from '@standardnotes/common'
import { PayloadInterface } from '../../../Abstract/Payload/Interfaces/PayloadInterface'
import { IntegrityPayload } from '../../../Abstract/Payload/IntegrityPayload'
import {
  isDecryptedPayload,
  isEncryptedErroredPayload,
  isEncryptedPayload,
} from '../../../Abstract/Payload/Interfaces/TypeCheck'
import { ItemContent } from '../../../Abstract/Item'
import { Collection } from '../Collection'
import { DeletedPayloadInterface } from '../../../Abstract/Payload'

export class PayloadCollection<
    P extends PayloadInterface = PayloadInterface,
    D extends DeletedPayloadInterface = DeletedPayloadInterface,
  >
  extends Collection<P, D>
  implements CollectionInterface
{
  /** An array of uuids of items that are errorDecrypting or waitingForKey */
  invalidsIndex: Set<Uuid> = new Set()

  readonly referenceMap: UuidMap

  /** Maintains an index for each item uuid where the value is an array of uuids that are
   * conflicts of that item. So if Note B and C are conflicts of Note A,
   * conflictMap[A.uuid] == [B.uuid, C.uuid] */
  readonly conflictMap: UuidMap

  constructor(
    copy = false,
    mapCopy?: Partial<Record<Uuid, P>>,
    typedMapCopy?: Partial<Record<ContentType, P[]>>,
    referenceMapCopy?: UuidMap,
    conflictMapCopy?: UuidMap,
  ) {
    super(copy, mapCopy, typedMapCopy)
    if (copy) {
      this.referenceMap = referenceMapCopy!
      this.conflictMap = conflictMapCopy!
    } else {
      this.referenceMap = new UuidMap()
      this.conflictMap = new UuidMap()
    }
  }

  public allDecrypted<C extends ItemContent = ItemContent>(
    contentType: ContentType,
  ): DecryptedPayloadInterface<C>[] {
    const allResults = this.all(contentType)
    const filtered: DecryptedPayloadInterface<C>[] = []

    allResults.forEach((payload) => {
      if (isDecryptedPayload<C>(payload)) {
        filtered.push(payload)
      }
    })

    return filtered
  }

  /** Returns all elements that are errorDecrypting or waitingForKey */
  public invalidElements(): EncryptedPayloadInterface[] {
    const uuids = Array.from(this.invalidsIndex)
    return this.findAllEncrypted(uuids)
  }

  public integrityPayloads(): IntegrityPayload[] {
    const nondeletedElements = this.nondeletedElements()

    return nondeletedElements.map((item) => ({
      uuid: item.uuid,
      updated_at_timestamp: item.serverUpdatedAtTimestamp as number,
    }))
  }

  public findAllEncrypted(uuids: Uuid[]): EncryptedPayloadInterface[] {
    const allResults = this.findAll(uuids)
    const filtered: EncryptedPayloadInterface[] = []

    allResults.forEach((payload) => {
      if (isEncryptedPayload(payload)) {
        filtered.push(payload)
      }
    })

    return filtered
  }

  public findAllDecrypted(uuids: Uuid[]): DecryptedPayloadInterface[] {
    const allResults = this.findAll(uuids)
    const filtered: DecryptedPayloadInterface[] = []

    allResults.forEach((payload) => {
      if (isDecryptedPayload(payload)) {
        filtered.push(payload)
      }
    })

    return filtered
  }

  public set(elements: P | P[]): void {
    super.set(elements)

    elements = Array.isArray(elements) ? elements : [elements]

    if (elements.length === 0) {
      console.warn('Attempting to set 0 elements onto collection')
      return
    }

    for (const element of elements) {
      if (
        isEncryptedErroredPayload(element) &&
        (element.errorDecrypting || element.waitingForKey)
      ) {
        this.invalidsIndex.add(element.uuid)
      } else {
        this.invalidsIndex.delete(element.uuid)
      }

      if (isDecryptedPayload(element)) {
        const conflictOf = element.content.conflict_of
        if (conflictOf) {
          this.conflictMap.establishRelationship(conflictOf, element.uuid)
        }

        this.referenceMap.setAllRelationships(
          element.uuid,
          element.references.map((r) => r.uuid),
        )
      }
    }
  }

  public discard(elements: (P | D) | (P | D)[]): void {
    super.discard(elements)
    elements = Array.isArray(elements) ? elements : [elements]
    for (const element of elements) {
      this.conflictMap.removeFromMap(element.uuid)
      this.referenceMap.removeFromMap(element.uuid)
    }
  }

  public uuidsThatReferenceUuid(uuid: Uuid): Uuid[] {
    if (!isString(uuid)) {
      throw Error('Must use uuid string')
    }
    return this.referenceMap.getInverseRelationships(uuid)
  }

  public elementsReferencingElement(
    element: P,
    contentType?: ContentType,
  ): DecryptedPayloadInterface[] {
    const uuids = this.uuidsThatReferenceUuid(element.uuid)
    const items = this.findAllDecrypted(uuids)

    if (!contentType) {
      return items
    }

    return items.filter((item) => item.content_type === contentType)
  }

  public uuidReferencesForUuid(uuid: Uuid): Uuid[] {
    if (!isString(uuid)) {
      throw Error('Must use uuid string')
    }
    return this.referenceMap.getDirectRelationships(uuid)
  }

  public referencesForElement(element: P): P[] {
    const uuids = this.referenceMap.getDirectRelationships(element.uuid)
    return this.findAll(uuids) as P[]
  }

  public conflictsOf(uuid: Uuid): DecryptedPayloadInterface[] {
    const uuids = this.conflictMap.getDirectRelationships(uuid)
    return this.findAllDecrypted(uuids)
  }
}

import { EncryptedTransferPayload } from './../../TransferPayload/Interfaces/EncryptedTransferPayload'
import { EncryptedPayload } from './../Implementations/EncryptedPayload'
import { ContentlessPayload } from './../Implementations/ContentlessPayload'
import { DeletedTransferPayload } from './../../TransferPayload/Interfaces/DeletedTransferPayload'
import { DeletedPayload } from './../Implementations/DeletedPayload'
import { ContentType, Uuid } from '@standardnotes/common'
import {
  Copy,
  extendArray,
  isString,
  pickByCopy,
  uniqueArray,
  UuidGenerator,
} from '@standardnotes/utils'
import { remove } from 'lodash'
import { ImmutablePayloadCollection } from '../../../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { ContentReference } from '../../Reference/ContentReference'
import { MaxPayloadFields, ValidPayloadKey } from '../Types/PayloadField'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import { PayloadFormat } from '../Types/PayloadFormat'
import { ItemContent } from '../../Item/Interfaces/ItemContent'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { PurePayload } from '../Implementations/PurePayload'
import { isEncryptedPayload } from '../Interfaces/TypeCheck'
import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { TransferPayload } from '../../TransferPayload/Interfaces/TransferPayload'
import { MaxTransferPayload } from '../../TransferPayload/Interfaces/MaxTransferPayload'
import { DecryptedPayload } from '../Implementations/DecryptedPayload'
import { DecryptedTransferPayload } from '../../TransferPayload/Interfaces/DecryptedTransferPayload'
import { MaxPayloadInterface } from '../Interfaces/MaxPayloadInterface'

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

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
  const copy = CopyPayload(payload, {
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

    const adjustedPayloads = matchingPayloads.map((a) =>
      CopyPayload(a, { items_key_id: copy.uuid }),
    )

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
    payload.fields,
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
    const result = CopyPayload(referencingPayload, {
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

export function CreatePayload(
  object: Partial<MaxTransferPayload>,
  fields: ValidPayloadKey[],
  source: PayloadSource = PayloadSource.Constructor,
  override?: Partial<MaxTransferPayload>,
): PayloadInterface {
  const rawPayload: MaxTransferPayload = pickByCopy(object, fields) as MaxTransferPayload

  const overrideFields =
    override instanceof PurePayload
      ? override.fields.slice()
      : (Object.keys(override || []) as ValidPayloadKey[])

  const typedOverride = override as MaxTransferPayload
  for (const field of overrideFields) {
    const value = typedOverride?.[field] as unknown
    rawPayload[field] = (value ? Copy(value) : value) as never
  }

  const newFields = uniqueArray(fields.concat(overrideFields))

  if (rawPayload.deleted) {
    return new DeletedPayload(rawPayload as unknown as DeletedTransferPayload, newFields, source)
  } else if (!rawPayload.content) {
    return new ContentlessPayload(rawPayload as unknown as ContentlessPayload, newFields, source)
  } else if (isString(rawPayload.content)) {
    return new EncryptedPayload(
      rawPayload as unknown as EncryptedTransferPayload,
      newFields,
      source,
    )
  } else {
    return new DecryptedPayload(
      rawPayload as unknown as DecryptedTransferPayload,
      newFields,
      source,
    )
  }
}

export function CopyPayload<P extends PayloadInterface = PayloadInterface>(
  payload: P,
  override?: Partial<MaxTransferPayload>,
): P {
  const result = CreatePayload(
    payload as unknown as MaxTransferPayload,
    payload.fields,
    payload.source,
    override,
  )
  return result as P
}

export function CopyPayloadWithContentOverride<C extends ItemContent = ItemContent>(
  payload: DecryptedPayloadInterface<C>,
  contentOverride: Partial<C>,
): DecryptedPayloadInterface<C> {
  const result = CreatePayload(payload, payload.fields, payload.source, {
    content: {
      ...payload.content,
      ...contentOverride,
    },
  })
  return result as DecryptedPayloadInterface<C>
}

/**
 * Makes a new payload by starting with input payload, then overriding values of all
 * keys of mergeWith.fields. If wanting to merge only specific fields, pass an array of
 * fields. If override value is passed, values in here take final precedence, including
 * above both payload and mergeWith values.
 */
export function PayloadByMerging<P extends MaxPayloadInterface = MaxPayloadInterface>(
  payload: P,
  mergeWith: P,
  fields?: ValidPayloadKey[],
  override?: Partial<P>,
): P {
  const resultOverride: Writeable<Partial<MaxPayloadInterface>> = {}
  const useFields = fields || mergeWith.fields

  for (const field of useFields) {
    const newValue = mergeWith[field]
    resultOverride[field] = newValue as never
  }

  if (override) {
    const keys = Object.keys(override) as ValidPayloadKey[]
    for (const key of keys) {
      resultOverride[key] = override[key] as never
    }
  }

  return CopyPayload(payload, resultOverride)
}

export function CreateMaxPayloadFromAnyObject(
  object: TransferPayload,
  override?: Partial<PayloadInterface>,
  source?: PayloadSource,
): PayloadInterface {
  return CreatePayload(object, MaxPayloadFields.slice(), source, override)
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

export function sureFindPayload(uuid: Uuid, payloads: PayloadInterface[]): PayloadInterface {
  return payloads.find((payload) => payload.uuid === uuid) as PayloadInterface
}

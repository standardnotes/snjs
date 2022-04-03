import { DecryptedPayload } from './../Implementations/DecryptedPayload'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentType, Uuid } from '@standardnotes/common'
import { Copy, extendArray, pickByCopy, uniqueArray, UuidGenerator } from '@standardnotes/utils'
import { remove } from 'lodash'
import { ImmutablePayloadCollection } from '../../../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { ContentReference } from '../../Reference/ContentReference'
import { PayloadField } from '../Types/PayloadField'
import { PayloadInterface } from '../Interfaces/PayloadInterface'
import { PayloadSource } from '../Types/PayloadSource'
import { PayloadFormat } from '../Types/PayloadFormat'
import { ItemContent } from '../../Item/Interfaces/ItemContent'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { PurePayload } from '../Implementations/PurePayload'

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
    const matchingPayloads = baseCollection.all().filter((p) => p.items_key_id === payload.uuid)
    const adjustedPayloads = matchingPayloads.map((a) =>
      CopyPayload(a, { items_key_id: copy.uuid }),
    )
    if (adjustedPayloads.length > 0) {
      extendArray(results, adjustedPayloads)
    }
  }

  const updatedSelf = CopyPayload(payload, {
    deleted: true,
    /** Do not set as dirty; this item is non-syncable
        and should be immediately discarded */
    dirty: false,
    content: undefined,
  })

  results.push(updatedSelf)
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

export function payloadFieldsForSource(source: PayloadSource): PayloadField[] {
  if (source === PayloadSource.FileImport) {
    return FilePayloadFields.slice()
  }

  if (source === PayloadSource.SessionHistory) {
    return SessionHistoryPayloadFields.slice()
  }

  if (source === PayloadSource.RemoteHistory) {
    return RemoteHistoryPayloadFields.slice()
  }

  if (source === PayloadSource.ComponentRetrieved) {
    return ComponentRetrievedPayloadFields.slice()
  }

  if (source === PayloadSource.ComponentCreated) {
    return ComponentCreatedPayloadFields.slice()
  }

  if (source === PayloadSource.LocalRetrieved || source === PayloadSource.LocalChanged) {
    return StoragePayloadFields.slice()
  }

  if (
    source === PayloadSource.RemoteRetrieved ||
    source === PayloadSource.ConflictData ||
    source === PayloadSource.ConflictUuid ||
    source === PayloadSource.RemoteRejected
  ) {
    return ServerPayloadFields.slice()
  }
  if (source === PayloadSource.LocalSaved || source === PayloadSource.RemoteSaved) {
    return ServerSavedPayloadFields.slice()
  } else {
    throw `No payload fields found for source ${source}`
  }
}
export function CreatePayload<C extends ItemContent = ItemContent>(
  object: PayloadInterface,
  fields: PayloadField[],
  source?: PayloadSource,
  override?: Partial<PayloadInterface>,
): PayloadInterface {
  const rawPayload = pickByCopy(object, fields)

  const overrideFields =
    override instanceof PurePayload
      ? override.fields.slice()
      : (Object.keys(override || []) as PayloadField[])

  for (const field of overrideFields) {
    const value = override?.[field] as unknown
    rawPayload[field] = value ? Copy(value) : value
  }

  const newFields = uniqueArray(fields.concat(overrideFields))

  return new PurePayload(rawPayload, newFields, source || PayloadSource.Constructor)
}

export function CopyPayload<P extends PayloadInterface = PayloadInterface>(
  payload: P,
  override?: Partial<P>,
): P {
  return CreatePayload(payload, payload.fields, payload.source, override)
}

export function CopyPayloadWithContentOverride<C extends ItemContent = ItemContent>(
  payload: DecryptedPayloadInterface<C>,
  contentOverride: Partial<C>,
): DecryptedPayloadInterface<C> {
  return CreatePayload(payload, payload.fields, payload.source, {
    content: {
      ...payload.content,
      ...contentOverride,
    },
  })
}

export function CreateSourcedPayloadFromObject(
  object: PayloadInterface,
  source: PayloadSource,
  override?: Partial<PayloadInterface>,
): PayloadInterface {
  if (source === PayloadSource.ComponentRetrieved) {
    return new DecryptedPayload({
      uuid: '123',
      content: {},
      content_type: object.content_type,
      created_at: object.created_at,
    })
  }
  const payloadFields = payloadFieldsForSource(source)
  return CreatePayload(object, payloadFields, source, override)
}

/**
 * Makes a new payload by starting with input payload, then overriding values of all
 * keys of mergeWith.fields. If wanting to merge only specific fields, pass an array of
 * fields. If override value is passed, values in here take final precedence, including
 * above both payload and mergeWith values.
 */
export function PayloadByMerging(
  payload: PayloadInterface,
  mergeWith: PayloadInterface,
  fields?: PayloadField[],
  override?: Partial<PayloadInterface>,
): PayloadInterface {
  const resultOverride: Writeable<Partial<PayloadInterface>> = {}
  const useFields = fields || mergeWith.fields

  for (const field of useFields) {
    resultOverride[field] = mergeWith[field]
  }

  if (override) {
    const keys = Object.keys(override) as PayloadField[]
    for (const key of keys) {
      resultOverride[key] = override[key]
    }
  }

  return CopyPayload(payload, resultOverride)
}

export function CreateMaxPayloadFromAnyObject(
  object: PayloadInterface,
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
    return payload.content == undefined
  }

  const acceptableFormats = [PayloadFormat.EncryptedString, PayloadFormat.MetadataOnly]

  return acceptableFormats.includes(payload.format)
}

export function sureFindPayload(uuid: Uuid, payloads: PayloadInterface[]): PayloadInterface {
  return payloads.find((payload) => payload.uuid === uuid) as PayloadInterface
}

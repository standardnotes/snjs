/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentType, Uuid } from '@standardnotes/common'
import { Copy, extendArray, pickByCopy, uniqueArray, UuidGenerator } from '@standardnotes/utils'
import { remove } from 'lodash'
import { PurePayload } from './PurePayload'
import { ImmutablePayloadCollection } from '../../Runtime/Collection/ImmutablePayloadCollection'
import { ContentReference } from '../Reference/ContentReference'
import { PayloadField } from './PayloadField'
import { PayloadInterface } from './PayloadInterface'
import { PayloadSource } from './PayloadSource'
import { RawPayload } from './RawPayload'
import { PayloadFormat } from './PayloadFormat'
import { DefaultAppDomain } from '../Item/DefaultAppDomain'
import { AppDataField } from '../Item/AppDataField'
import { ItemContent, SpecializedContent } from '../Item/ItemContent'
import { CreateItemFromPayload } from '../Item/Generator'
import { AffectorMapping } from './AffectorFunction'

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }

/**
 * Return the payloads that result if you alternated the uuid for the payload.
 * Alternating a UUID involves instructing related items to drop old references of a uuid
 * for the new one.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByAlternatingUuid(
  payload: PayloadInterface,
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
  payload: PayloadInterface,
  baseCollection: ImmutablePayloadCollection,
  add: PayloadInterface[] = [],
  removeIds: Uuid[] = [],
): PayloadInterface[] {
  const referencingPayloads = baseCollection.elementsReferencingElement(payload)
  const results = []
  for (const referencingPayload of referencingPayloads) {
    const references = referencingPayload.contentObject.references.slice()
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
        ...referencingPayload.safeContent,
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
  object: any,
  fields: PayloadField[],
  source?: PayloadSource,
  override?: Partial<PayloadInterface<C>>,
): PayloadInterface<C> {
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

export function CopyPayload<C extends ItemContent = ItemContent>(
  payload: PayloadInterface<C>,
  override?: Partial<PayloadInterface<C>>,
): PayloadInterface<C> {
  return CreatePayload(payload, payload.fields, payload.source, override)
}

export function CopyPayloadWithContentOverride<C extends ItemContent = ItemContent>(
  payload: PayloadInterface<C>,
  contentOverride: Partial<C>,
): PayloadInterface<C> {
  return CreatePayload(payload, payload.fields, payload.source, {
    content: {
      ...payload.safeContent,
      ...contentOverride,
    },
  })
}

export function CreateSourcedPayloadFromObject<C extends ItemContent = ItemContent>(
  object: RawPayload<C>,
  source: PayloadSource,
  override?: Partial<PayloadInterface<C>>,
): PayloadInterface<C> {
  const payloadFields = payloadFieldsForSource(source)
  return CreatePayload(object, payloadFields, source, override)
}

/**
 * Makes a new payload by starting with input payload, then overriding values of all
 * keys of mergeWith.fields. If wanting to merge only specific fields, pass an array of
 * fields. If override value is passed, values in here take final precedence, including
 * above both payload and mergeWith values.
 */
export function PayloadByMerging<C extends ItemContent = ItemContent>(
  payload: PayloadInterface<C>,
  mergeWith: PayloadInterface<C>,
  fields?: PayloadField[],
  override?: Partial<PayloadInterface<C>>,
): PayloadInterface<C> {
  const resultOverride: Writeable<Partial<PayloadInterface<C>>> = {}
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

export function CreateMaxPayloadFromAnyObject<C extends ItemContent = ItemContent>(
  object: RawPayload<C>,
  override?: Partial<PayloadInterface<C>>,
  source?: PayloadSource,
): PayloadInterface<C> {
  return CreatePayload(object, MaxPayloadFields.slice(), source, override)
}

/** The MaxItemPayload represents a payload with all possible fields */
export const MaxPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.CreatedAt,
  PayloadField.ServerUpdatedAt,
  PayloadField.CreatedAtTimestamp,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.Deleted,
  PayloadField.Legacy003AuthHash,
  PayloadField.Legacy003AuthParams,
  PayloadField.Dirty,
  PayloadField.DirtiedDate,
  PayloadField.ErrorDecrypting,
  PayloadField.ErrorDecryptingChanged,
  PayloadField.WaitingForKey,
  PayloadField.LastSyncBegan,
  PayloadField.LastSyncEnd,
  PayloadField.DuplicateOf,
])

export const FilePayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.CreatedAt,
  PayloadField.ServerUpdatedAt,
  PayloadField.CreatedAtTimestamp,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.Legacy003AuthHash,
  PayloadField.DuplicateOf,
])

export const StoragePayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.CreatedAt,
  PayloadField.ServerUpdatedAt,
  PayloadField.CreatedAtTimestamp,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.Deleted,
  PayloadField.Legacy003AuthHash,
  PayloadField.Legacy003AuthParams,
  PayloadField.Dirty,
  PayloadField.DirtiedDate,
  PayloadField.ErrorDecrypting,
  PayloadField.WaitingForKey,
  PayloadField.DuplicateOf,
])

export const ServerPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.CreatedAt,
  PayloadField.ServerUpdatedAt,
  PayloadField.CreatedAtTimestamp,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.Deleted,
  PayloadField.Legacy003AuthHash,
  PayloadField.DuplicateOf,
])

export const SessionHistoryPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.Content,
  PayloadField.ServerUpdatedAt,
])

/** Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving */
export const ComponentRetrievedPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
])

/** Represents a payload with permissible fields for when a
 * component wants to create a new item */
export const ComponentCreatedPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
])

/**
 * The saved server item payload represents the payload we want to map
 * when mapping saved_items from the server. We only want to map the
 * updated_at value the server returns for the item, and basically
 * nothing else.
 */
export const ServerSavedPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ServerUpdatedAt,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.CreatedAtTimestamp,
  PayloadField.Deleted,
  PayloadField.Dirty,
  PayloadField.LastSyncEnd,
])

export const RemoteHistoryPayloadFields = Object.freeze(ServerPayloadFields.slice())

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

/**
 * Modifies the input object to fill in any missing required values from the
 * content body.
 */
export function FillItemContent<C extends ItemContent = ItemContent>(content: Partial<C>): C {
  if (!content.references) {
    content.references = []
  }

  if (!content.appData) {
    content.appData = {
      [DefaultAppDomain]: {},
    }
  }

  if (!content.appData[DefaultAppDomain]) {
    content.appData[DefaultAppDomain] = {}
  }

  if (!content.appData[DefaultAppDomain][AppDataField.UserModifiedDate]) {
    content.appData[DefaultAppDomain][AppDataField.UserModifiedDate] = `${new Date()}`
  }

  return content as C
}

export function FillItemContentSpecialized<
  S extends SpecializedContent,
  C extends ItemContent = ItemContent,
>(content: S): C {
  const typedContent = content as unknown as C
  if (!typedContent.references) {
    typedContent.references = []
  }

  if (!typedContent.appData) {
    typedContent.appData = {
      [DefaultAppDomain]: {},
    }
  }

  if (!typedContent.appData[DefaultAppDomain]) {
    typedContent.appData[DefaultAppDomain] = {}
  }

  if (!typedContent.appData[DefaultAppDomain][AppDataField.UserModifiedDate]) {
    typedContent.appData[DefaultAppDomain][AppDataField.UserModifiedDate] = `${new Date()}`
  }

  return typedContent
}

export function filterDisallowedRemotePayloads(payloads: PurePayload[]): PurePayload[] {
  return payloads.filter(isRemotePayloadAllowed)
}

export function isRemotePayloadAllowed(payload: PurePayload): boolean {
  if (payload.format === PayloadFormat.Deleted) {
    return payload.content == undefined
  }

  const acceptableFormats = [PayloadFormat.EncryptedString, PayloadFormat.MetadataOnly]

  return acceptableFormats.includes(payload.format)
}

export function sureFindPayload(uuid: Uuid, payloads: PurePayload[]): PurePayload {
  return payloads.find((payload) => payload.uuid === uuid) as PurePayload
}

/**
 * Compares the .content fields for equality, creating new SNItem objects
 * to properly handle .content intricacies.
 */
export function PayloadContentsEqual(payloadA: PurePayload, payloadB: PurePayload): boolean {
  const itemA = CreateItemFromPayload(payloadA)
  const itemB = CreateItemFromPayload(payloadB)
  return itemA.isItemContentEqualWith(itemB)
}

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
    ...payload.safeContent,
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

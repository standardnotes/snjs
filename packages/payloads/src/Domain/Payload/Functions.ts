/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDataField, DefaultAppDomain, EncryptionIntent } from '@standardnotes/applications'
import { ContentType, Uuid } from '@standardnotes/common'
import { Copy, extendArray, pickByCopy, uniqueArray, UuidGenerator } from '@standardnotes/utils'
import { remove } from 'lodash'

import { PurePayload } from '../Payload/PurePayload'
import { ImmutablePayloadCollection } from '../Collection/ImmutablePayloadCollection'
import { RawEncryptionParameters } from '../Encryption/RawEncryptionParameters'
import { ContentReference } from '../Reference/ContentReference'

import { PayloadContent } from './PayloadContent'
import { PayloadField } from './PayloadField'
import { PayloadInterface } from './PayloadInterface'
import { PayloadOverride } from './PayloadOverride'
import { PayloadSource } from './PayloadSource'
import { RawPayload } from './RawPayload'
import { PayloadFormat } from './PayloadFormat'

/**
 * Return the payloads that result if you alternated the uuid for the payload.
 * Alternating a UUID involves instructing related items to drop old references of a uuid
 * for the new one.
 * @returns An array of payloads that have changed as a result of copying.
 */
export async function PayloadsByAlternatingUuid(
  payload: PayloadInterface,
  baseCollection: ImmutablePayloadCollection
): Promise<PayloadInterface[]> {
  const results: PayloadInterface[] = []
  /**
   * We need to clone payload and give it a new uuid,
   * then delete item with old uuid from db (cannot modify uuids in our IndexedDB setup)
   */
  const copy = CopyPayload(payload, {
    uuid: await UuidGenerator.GenerateUuid(),
    dirty: true,
    dirtiedDate: new Date(),
    lastSyncBegan: null,
    lastSyncEnd: null,
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
    [payload.uuid]
  )
  extendArray(results, updatedReferencing)

  if (payload.content_type === ContentType.ItemsKey) {
    /**
     * Update any payloads who are still encrypted and whose items_key_id point to this uuid
     */
    const matchingPayloads = baseCollection
      .all()
      .filter((p) => p.items_key_id === payload.uuid)
    const adjustedPayloads = matchingPayloads.map((a) =>
      CopyPayload(a, { items_key_id: copy.uuid })
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
  removeIds: Uuid[] = []
): PayloadInterface[] {
  const referencingPayloads = baseCollection.elementsReferencingElement(
    payload
  )
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

  if (
    source === PayloadSource.LocalRetrieved ||
    source === PayloadSource.LocalChanged
  ) {
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
  if (
    source === PayloadSource.LocalSaved ||
    source === PayloadSource.RemoteSaved
  ) {
    return ServerSavedPayloadFields.slice()
  } else {
    throw `No payload fields found for source ${source}`
  }
}

function payloadFieldsForIntent(intent: EncryptionIntent) {
  if (
    intent === EncryptionIntent.FileEncrypted ||
    intent === EncryptionIntent.FileDecrypted ||
    intent === EncryptionIntent.FilePreferEncrypted
  ) {
    return FilePayloadFields.slice()
  }

  if (
    intent === EncryptionIntent.LocalStoragePreferEncrypted ||
    intent === EncryptionIntent.LocalStorageDecrypted ||
    intent === EncryptionIntent.LocalStorageEncrypted
  ) {
    return StoragePayloadFields.slice()
  }

  if (intent === EncryptionIntent.Sync) {
    return ServerPayloadFields.slice()
  } else {
    throw `No payload fields found for intent ${intent}`
  }
}

export function CopyEncryptionParameters(
  raw: RawEncryptionParameters,
  override?: RawEncryptionParameters
): PayloadInterface {
  return CreatePayload(
    raw,
    EncryptionParametersFields.slice(),
    undefined,
    override
  )
}

export function CreateEncryptionParameters(
  raw: RawEncryptionParameters,
  source?: PayloadSource
): PayloadInterface {
  const fields = Object.keys(raw) as PayloadField[]
  return CreatePayload(raw, fields, source)
}

function CreatePayload(
  object: any,
  fields: PayloadField[],
  source?: PayloadSource,
  override?: PayloadOverride
): PayloadInterface {
  const rawPayload = pickByCopy(object, fields)
  const overrideFields =
    override instanceof PurePayload
      ? override.fields.slice()
      : (Object.keys(override || []) as PayloadField[])
  for (const field of overrideFields) {
    const value = override![field]
    rawPayload[field] = value ? Copy(value) : value
  }
  const newFields = uniqueArray(fields.concat(overrideFields))
  return new PurePayload(
    rawPayload,
    newFields,
    source || PayloadSource.Constructor
  )
}

export function CopyPayload(
  payload: PayloadInterface,
  override?: PayloadOverride
): PayloadInterface {
  return CreatePayload(payload, payload.fields, payload.source, override)
}

export function CreateSourcedPayloadFromObject(
  object: RawPayload,
  source: PayloadSource,
  override?: PayloadOverride
): PayloadInterface {
  const payloadFields = payloadFieldsForSource(source)
  return CreatePayload(object, payloadFields, source, override)
}

export function CreateIntentPayloadFromObject(
  object: RawPayload,
  intent: EncryptionIntent,
  override?: PayloadOverride
): PayloadInterface {
  const payloadFields = payloadFieldsForIntent(intent)
  return CreatePayload(
    object,
    payloadFields,
    PayloadSource.Constructor,
    override
  )
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
  override?: PayloadOverride
): PayloadInterface {
  const resultOverride: PayloadOverride = {}
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
  object: RawPayload,
  override?: PayloadOverride,
  source?: PayloadSource
): PayloadInterface {
  return CreatePayload(object, MaxPayloadFields.slice(), source, override)
}

/** The MaxItemPayload represents a payload with all possible fields */
const MaxPayloadFields = Object.freeze([
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

const EncryptionParametersFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.Legacy003AuthHash,
  PayloadField.ErrorDecrypting,
  PayloadField.ErrorDecryptingChanged,
  PayloadField.WaitingForKey,
])

const FilePayloadFields = Object.freeze([
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

const StoragePayloadFields = Object.freeze([
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

const ServerPayloadFields = Object.freeze([
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

const SessionHistoryPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.Content,
  PayloadField.ServerUpdatedAt,
])

/** Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving */
const ComponentRetrievedPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
])

/** Represents a payload with permissible fields for when a
 * component wants to create a new item */
const ComponentCreatedPayloadFields = Object.freeze([
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
const ServerSavedPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ServerUpdatedAt,
  PayloadField.ServerUpdatedAtTimestamp,
  PayloadField.CreatedAtTimestamp,
  PayloadField.Deleted,
  PayloadField.Dirty,
  PayloadField.LastSyncEnd,
])

const RemoteHistoryPayloadFields = Object.freeze(ServerPayloadFields.slice())

/**
 * Whether the changed payload represents only an internal change that shouldn't
 * require a UI refresh
 */
export function isPayloadSourceInternalChange(source: PayloadSource): boolean {
  return [PayloadSource.RemoteSaved, PayloadSource.PreSyncSave].includes(
    source
  )
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
export function FillItemContent(content: Record<string, any>): PayloadContent {
  if (!content.references) {
    content.references = []
  }
  if (!content.appData) {
    content.appData = {}
  }
  if (!content.appData[DefaultAppDomain]) {
    content.appData[DefaultAppDomain] = {}
  }
  if (!content.appData[DefaultAppDomain][AppDataField.UserModifiedDate]) {
    content.appData[DefaultAppDomain][
      AppDataField.UserModifiedDate
    ] = `${new Date()}`
  }
  return content as PayloadContent
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

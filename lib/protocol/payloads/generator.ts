import { PayloadSource } from '@Payloads/sources';
import { ContentType } from '@Models/content_types';
import { PurePayload } from '@Payloads/index';
import { EncryptionIntent } from '@Protocol/intents';
import {
  Copy,
  isNullOrUndefined,
  pickByCopy,
  uniqueArray,
} from '@Lib/utils';
import { PayloadField } from '@Payloads/fields';

export type ContentReference = {
  uuid: string
  content_type: string
}

export type PayloadContent = {
  [key: string]: any
  references: ContentReference[]
}

export type PayloadOverride = {
  [key in PayloadField]?: any;
} | PurePayload

export type RawPayload = {
  uuid?: string
  content_type?: ContentType
  content?: PayloadContent | string
  deleted?: boolean
  items_key_id?: string
  enc_item_key?: string
  created_at?: Date
  updated_at?: Date
  dirtiedDate?: Date
  dirty?: boolean
  dummy?: boolean
  errorDecrypting?: boolean
  waitingForKey?: boolean
  errorDecryptingValueChanged?: boolean
  lastSyncBegan?: Date
  lastSyncEnd?: Date
  auth_hash?: string
  auth_params?: any
}

/** The MaxItemPayload represents a payload with all possible fields */
const MaxPayloadFields = [
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.CreatedAt,
  PayloadField.UpdatedAt,
  PayloadField.Deleted,
  PayloadField.Legacy003AuthHash,
  PayloadField.Legacy003AuthParams,
  PayloadField.Dirty,
  PayloadField.DirtiedDate,
  PayloadField.ErrorDecrypting,
  PayloadField.ErrorDecryptingChanged,
  PayloadField.WaitingForKey,
  PayloadField.Dummy,
  PayloadField.LastSyncBegan,
  PayloadField.LastSyncEnd,
]

const EncryptionParametersFields = [
  PayloadField.Uuid,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.Legacy003AuthHash,
  PayloadField.ErrorDecrypting,
  PayloadField.ErrorDecryptingChanged,
  PayloadField.WaitingForKey
];

const FilePayloadFields = [
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.CreatedAt,
  PayloadField.UpdatedAt,
  PayloadField.Legacy003AuthHash
]

const StoragePayloadFields = [
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.CreatedAt,
  PayloadField.UpdatedAt,
  PayloadField.Deleted,
  PayloadField.Legacy003AuthHash,
  PayloadField.Legacy003AuthParams,
  PayloadField.Dirty,
  PayloadField.DirtiedDate,
  PayloadField.ErrorDecrypting,
  PayloadField.WaitingForKey
]

const ServerPayloadFields = [
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.CreatedAt,
  PayloadField.UpdatedAt,
  PayloadField.Deleted,
  PayloadField.Legacy003AuthHash
]

const SessionHistoryPayloadFields = [
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.Content,
  PayloadField.UpdatedAt,
]

/** Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving */
const ComponentRetrievedPayloadFields = [
  PayloadField.Uuid,
  PayloadField.Content,
  PayloadField.CreatedAt
]

/**
 * The saved server item payload represents the payload we want to map
 * when mapping saved_items from the server. We only want to map the
 * updated_at value the server returns for the item, and basically
 * nothing else.
 */
const ServerSavedPayloadFields = [
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.UpdatedAt,
  PayloadField.Deleted,
  PayloadField.Dirty,
  PayloadField.LastSyncEnd
]

export function CreateMaxPayloadFromAnyObject(
  object: RawPayload,
  source?: PayloadSource,
  intent?: EncryptionIntent,
  override?: PayloadOverride
) {
  if (!isNullOrUndefined(source as any)) {
    throw 'Use CreateSourcedPayloadFromObject if creating payload with source.';
  }
  if (!isNullOrUndefined(intent as any)) {
    throw 'Use CreateIntentPayloadFromObject if creating payload with intent.';
  }
  return CreatePayload(
    object,
    MaxPayloadFields.slice(),
    source,
    override
  );
}

export function CreateIntentPayloadFromObject(
  object: RawPayload,
  intent: EncryptionIntent,
  override?: PayloadOverride
) {
  const payloadFields = payloadFieldsForIntent(intent);
  return CreatePayload(
    object,
    payloadFields,
    PayloadSource.Constructor,
    override
  );
}

export function CreateSourcedPayloadFromObject(
  object: RawPayload,
  source: PayloadSource,
  override?: PayloadOverride
) {
  const payloadFields = payloadFieldsForSource(source);
  return CreatePayload(
    object,
    payloadFields,
    source,
    override
  );
}

export function CopyPayload(
  payload: PurePayload,
  override?: PayloadOverride
): PurePayload {
  return CreatePayload(
    payload,
    payload.fields,
    payload.source,
    override
  );
}

function CreatePayload(
  object: object,
  fields: PayloadField[],
  source?: PayloadSource,
  override?: PayloadOverride
): PurePayload {
  const rawPayload = pickByCopy(object, fields);
  const overrideFields = override instanceof PurePayload
    ? override.fields.slice()
    : Object.keys(override || []) as PayloadField[];
  for (const field of overrideFields) {
    const value = override![field];
    rawPayload[field] = value ? Copy(value) : value;
  }
  const newFields = uniqueArray(fields.concat(overrideFields));
  return new PurePayload(
    rawPayload,
    newFields,
    source || PayloadSource.Constructor
  );
}

export function CreateEncryptionParameters(
  raw: RawPayload | PurePayload
): PurePayload {
  return CreatePayload(
    raw,
    EncryptionParametersFields.slice(),
  );
}

export function CopyEncryptionParameters(
  raw: PurePayload,
  override?: PayloadOverride
): PurePayload {
  return CreatePayload(
    raw,
    EncryptionParametersFields.slice(),
    undefined,
    override
  );
}

function payloadFieldsForIntent(intent: EncryptionIntent) {
  if ((
    intent === EncryptionIntent.FileEncrypted ||
    intent === EncryptionIntent.FileDecrypted ||
    intent === EncryptionIntent.FilePreferEncrypted
  )) {
    return FilePayloadFields.slice();
  }

  if ((
    intent === EncryptionIntent.LocalStoragePreferEncrypted ||
    intent === EncryptionIntent.LocalStorageDecrypted ||
    intent === EncryptionIntent.LocalStorageEncrypted
  )) {
    return StoragePayloadFields.slice();
  }

  if ((
    intent === EncryptionIntent.Sync ||
    intent === EncryptionIntent.SyncDecrypted
  )) {
    return ServerPayloadFields.slice();
  } else {
    throw `No payload fields found for intent ${intent}`;
  }
}

export function payloadFieldsForSource(source: PayloadSource) {
  if (source === PayloadSource.FileImport) {
    return FilePayloadFields.slice();
  }

  if (source === PayloadSource.SessionHistory) {
    return SessionHistoryPayloadFields.slice();
  }

  if (source === PayloadSource.ComponentRetrieved) {
    return ComponentRetrievedPayloadFields.slice();
  }

  if ((
    source === PayloadSource.LocalRetrieved ||
    source === PayloadSource.LocalDirtied
  )) {
    return StoragePayloadFields.slice();
  }

  if ((
    source === PayloadSource.RemoteRetrieved ||
    source === PayloadSource.ConflictData ||
    source === PayloadSource.ConflictUuid
  )) {
    return ServerPayloadFields.slice();
  }
  if ((
    source === PayloadSource.LocalSaved ||
    source === PayloadSource.RemoteSaved
  )) {
    return ServerSavedPayloadFields.slice();
  } else {
    throw `No payload fields found for source ${source}`;
  }
}

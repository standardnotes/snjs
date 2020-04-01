import { ContentTypes } from '@Models/content_types';
import {
  PayloadSources,
  PurePayload,
} from '@Payloads/index';
import { EncryptionIntents } from '@Protocol/intents';
import {
  Copy,
  deepMerge,
  isNullOrUndefined,
  isObject,
  pickByCopy,
} from '@Lib/utils';
import { PayloadFields } from '@Payloads/fields';

export type ContentReference = {
  uuid: string
  content_type: string
}

export type PayloadContent = {
  [key: string]: any
  references: ContentReference[]
}

export type PayloadOverride = {
  [key in PayloadFields]?: any;
} | PurePayload

export type RawPayload = {
  uuid?: string
  content_type?: ContentTypes
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
  PayloadFields.Uuid,
  PayloadFields.ContentType,
  PayloadFields.ItemsKeyId,
  PayloadFields.EncItemKey,
  PayloadFields.Content,
  PayloadFields.CreatedAt,
  PayloadFields.UpdatedAt,
  PayloadFields.Deleted,
  PayloadFields.Legacy003AuthHash,
  PayloadFields.Legacy003AuthParams,
  PayloadFields.Dirty,
  PayloadFields.DirtiedDate,
  PayloadFields.ErrorDecrypting,
  PayloadFields.ErrorDecryptingChanged,
  PayloadFields.WaitingForKey,
  PayloadFields.Dummy,
  PayloadFields.LastSyncBegan,
  PayloadFields.LastSyncEnd,
]

export function CreateMaxPayloadFromAnyObject(
  object: object,
  source?: PayloadSources,
  intent?: EncryptionIntents,
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
    MaxPayloadFields,
    override
  );
}

export function CreateIntentPayloadFromObject(
  object: any,
  intent: EncryptionIntents,
  override?: PayloadOverride
) {
  const payloadFields = payloadFieldsForIntent(intent);
  return CreatePayload(
    object,
    payloadFields,
    override
  );
}

export function CreateSourcedPayloadFromObject(
  object: object,
  source: PayloadSources,
  override?: PayloadOverride
) {
  const payloadFields = payloadFieldsForSource(source);
  return CreatePayload(
    object,
    payloadFields,
    override
  );
}

function CreatePayload(
  object: object,
  fields: PayloadFields[],
  override?: PayloadOverride
): PurePayload {
  const rawPayload = pickByCopy(object, fields);
  if(!fields) {
    debugger;
  }
  if (override) {
    if (!isObject(override)) {
      throw 'Attempting to override payload with non-object';
    }
    deepMerge(rawPayload, Copy(override));
  }
  return new PurePayload(rawPayload, fields);
}

export function CopyPayload(
  payload: PurePayload,
  override?: PayloadOverride
): PurePayload {
  const rawPayload = pickByCopy(payload, payload.fields);
  if (override) {
    deepMerge(rawPayload, Copy(override));
  }
  return new PurePayload(rawPayload, payload.fields);
}

const EncryptionParametersFields = [
  PayloadFields.Uuid,
  PayloadFields.ItemsKeyId,
  PayloadFields.EncItemKey,
  PayloadFields.Content,
  PayloadFields.Legacy003AuthHash,
  PayloadFields.ErrorDecrypting,
  PayloadFields.ErrorDecryptingChanged,
  PayloadFields.WaitingForKey
];

export function CreateEncryptionParameters(raw: RawPayload | PurePayload): PurePayload {
  return CreatePayload(
    raw,
    EncryptionParametersFields,
  );
}

export function CopyEncryptionParameters(
  raw: RawPayload | PurePayload,
  override?: PayloadOverride
): PurePayload {
  return CreatePayload(
    raw,
    EncryptionParametersFields,
    override
  );
}

const FilePayloadFields = [
  PayloadFields.Uuid,
  PayloadFields.ContentType,
  PayloadFields.ItemsKeyId,
  PayloadFields.EncItemKey,
  PayloadFields.Content,
  PayloadFields.CreatedAt,
  PayloadFields.UpdatedAt,
  PayloadFields.Legacy003AuthHash
]

const StoragePayloadFields = [
  PayloadFields.Uuid,
  PayloadFields.ContentType,
  PayloadFields.ItemsKeyId,
  PayloadFields.EncItemKey,
  PayloadFields.Content,
  PayloadFields.CreatedAt,
  PayloadFields.UpdatedAt,
  PayloadFields.Deleted,
  PayloadFields.Legacy003AuthHash,
  PayloadFields.Legacy003AuthParams,
  PayloadFields.Dirty,
  PayloadFields.DirtiedDate,
  PayloadFields.ErrorDecrypting,
  PayloadFields.WaitingForKey
]

const ServerPayloadFields = [
  PayloadFields.Uuid,
  PayloadFields.ContentType,
  PayloadFields.ItemsKeyId,
  PayloadFields.EncItemKey,
  PayloadFields.Content,
  PayloadFields.CreatedAt,
  PayloadFields.UpdatedAt,
  PayloadFields.Deleted,
  PayloadFields.Legacy003AuthHash
]

const SessionHistoryPayloadFields = [
  PayloadFields.Uuid,
  PayloadFields.ContentType,
  PayloadFields.Content,
  PayloadFields.UpdatedAt,
]

/** Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving */
const ComponentRetrievedPayloadFields = [
  PayloadFields.Uuid,
  PayloadFields.Content,
  PayloadFields.CreatedAt
]

/**
 * The saved server item payload represents the payload we want to map
 * when mapping saved_items from the server. We only want to map the
 * updated_at value the server returns for the item, and basically
 * nothing else.
 */
const ServerSavedPayloadFields = [
  PayloadFields.Uuid,
  PayloadFields.ContentType,
  PayloadFields.UpdatedAt,
  PayloadFields.Deleted,
  PayloadFields.Dirty,
  PayloadFields.LastSyncEnd
]

function payloadFieldsForIntent(intent: EncryptionIntents) {
  if ((
    intent === EncryptionIntents.FileEncrypted ||
    intent === EncryptionIntents.FileDecrypted ||
    intent === EncryptionIntents.FilePreferEncrypted
  )) {
    return FilePayloadFields;
  }

  if ((
    intent === EncryptionIntents.LocalStoragePreferEncrypted ||
    intent === EncryptionIntents.LocalStorageDecrypted ||
    intent === EncryptionIntents.LocalStorageEncrypted
  )) {
    return StoragePayloadFields;
  }

  if ((
    intent === EncryptionIntents.Sync ||
    intent === EncryptionIntents.SyncDecrypted
  )) {
    return ServerPayloadFields;
  } else {
    throw `No payload fields found for intent ${intent}`;
  }
}

export function payloadFieldsForSource(source: PayloadSources) {
  if (source === PayloadSources.FileImport) {
    return FilePayloadFields;
  }

  if (source === PayloadSources.SessionHistory) {
    return SessionHistoryPayloadFields;
  }

  if (source === PayloadSources.ComponentRetrieved) {
    return ComponentRetrievedPayloadFields;
  }

  if ((
    source === PayloadSources.LocalRetrieved ||
    source === PayloadSources.LocalDirtied
  )) {
    return StoragePayloadFields;
  }

  if ((
    source === PayloadSources.RemoteRetrieved ||
    source === PayloadSources.ConflictData ||
    source === PayloadSources.ConflictUuid
  )) {
    return ServerPayloadFields;
  }
  if ((
    source === PayloadSources.LocalSaved ||
    source === PayloadSources.RemoteSaved
  )) {
    return ServerSavedPayloadFields;
  } else {
    throw `No payload fields found for source ${source}`;
  }
}

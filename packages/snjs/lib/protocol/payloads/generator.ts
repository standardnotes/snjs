import { AnyKeyParamsContent } from './../key_params';
import { ProtocolVersion } from './../versions';
import { UuidString } from './../../types';
import { PurePayload } from '@Payloads/pure_payload';
import { PayloadSource } from '@Payloads/sources';
import { ContentType } from '@standardnotes/common';
import { EncryptionIntent } from '@Protocol/intents';
import { Copy, pickByCopy, uniqueArray } from '@Lib/utils';
import { PayloadField } from '@Payloads/fields';

export interface LegacyTagToNoteReference {
  uuid: string;
  content_type: string;
}

export enum ContenteReferenceType {
  tagToParentTag = 'TagToParentTag',
}

export interface TagToParentTagReference {
  reference_type: ContenteReferenceType.tagToParentTag;
  uuid: string;
  content_type: string;
}

export type ContentReference =
  | LegacyTagToNoteReference
  | TagToParentTagReference;

export const isTagToParentTagReference = (
  x: ContentReference
): x is TagToParentTagReference => {
  return (x as any).reference_type === ContenteReferenceType.tagToParentTag;
};

export type PayloadContent = {
  [key: string]: any;
  references: ContentReference[];
};

export type PayloadOverride =
  | {
      [key in PayloadField]?: any;
    }
  | PurePayload;

export type RawPayload = {
  uuid: string;
  content_type: ContentType;
  content?: PayloadContent | string;
  deleted?: boolean;
  items_key_id?: string;
  enc_item_key?: string;
  created_at?: Date;
  updated_at?: Date;
  created_at_timestamp?: number;
  updated_at_timestamp?: number;
  dirtiedDate?: Date;
  dirty?: boolean;
  errorDecrypting?: boolean;
  waitingForKey?: boolean;
  errorDecryptingValueChanged?: boolean;
  lastSyncBegan?: Date;
  lastSyncEnd?: Date;
  auth_hash?: string;
  auth_params?: any;
  duplicate_of?: string;
};

export type RawEncryptionParameters = {
  uuid?: string;
  content?: PayloadContent | string;
  items_key_id?: string;
  enc_item_key?: string;
  errorDecrypting?: boolean;
  waitingForKey?: boolean;
  errorDecryptingValueChanged?: boolean;
  auth_hash?: string;
  auth_params?: any;
};

export type ItemAuthenticatedData = {
  /** The UUID of the item */
  u: UuidString;
  /** The encryption version of the item */
  v: ProtocolVersion;
};
/** Data that is attached to items that are encrypted with a root key */
export type RootKeyEncryptedAuthenticatedData = ItemAuthenticatedData & {
  /** The key params used to generate the root key that encrypts this item key */
  kp: AnyKeyParamsContent;
};
/**
 * <= V003 optionally included key params content as last component in encrypted string
 * as a json stringified base64 representation. This data is attached but not included
 * in authentication hash.
 */
export type LegacyAttachedData = AnyKeyParamsContent & Record<string, unknown>;

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
]);

const EncryptionParametersFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ItemsKeyId,
  PayloadField.EncItemKey,
  PayloadField.Content,
  PayloadField.Legacy003AuthHash,
  PayloadField.ErrorDecrypting,
  PayloadField.ErrorDecryptingChanged,
  PayloadField.WaitingForKey,
]);

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
]);

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
]);

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
]);

const SessionHistoryPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.ContentType,
  PayloadField.Content,
  PayloadField.ServerUpdatedAt,
]);

/** Represents a payload with permissible fields for when a
 * payload is retrieved from a component for saving */
const ComponentRetrievedPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
]);

/** Represents a payload with permissible fields for when a
 * component wants to create a new item */
const ComponentCreatedPayloadFields = Object.freeze([
  PayloadField.Uuid,
  PayloadField.Content,
  PayloadField.ContentType,
  PayloadField.CreatedAt,
]);

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
]);

const RemoteHistoryPayloadFields = Object.freeze(ServerPayloadFields.slice());

export function CreateMaxPayloadFromAnyObject(
  object: RawPayload,
  override?: PayloadOverride,
  source?: PayloadSource
): PurePayload {
  return CreatePayload(object, MaxPayloadFields.slice(), source, override);
}

/**
 * Makes a new payload by starting with input payload, then overriding values of all
 * keys of mergeWith.fields. If wanting to merge only specific fields, pass an array of
 * fields. If override value is passed, values in here take final precedence, including
 * above both payload and mergeWith values.
 */
export function PayloadByMerging(
  payload: PurePayload,
  mergeWith: PurePayload,
  fields?: PayloadField[],
  override?: PayloadOverride
): PurePayload {
  const resultOverride: PayloadOverride = {};
  const useFields = fields || mergeWith.fields;
  for (const field of useFields) {
    resultOverride[field] = mergeWith[field];
  }
  if (override) {
    const keys = Object.keys(override) as PayloadField[];
    for (const key of keys) {
      resultOverride[key] = override[key];
    }
  }
  return CopyPayload(payload, resultOverride);
}

export function CreateIntentPayloadFromObject(
  object: RawPayload,
  intent: EncryptionIntent,
  override?: PayloadOverride
): PurePayload {
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
): PurePayload {
  const payloadFields = payloadFieldsForSource(source);
  return CreatePayload(object, payloadFields, source, override);
}

export function CopyPayload(
  payload: PurePayload,
  override?: PayloadOverride
): PurePayload {
  return CreatePayload(payload, payload.fields, payload.source, override);
}

function CreatePayload(
  object: any,
  fields: PayloadField[],
  source?: PayloadSource,
  override?: PayloadOverride
): PurePayload {
  const rawPayload = pickByCopy(object, fields);
  const overrideFields =
    override instanceof PurePayload
      ? override.fields.slice()
      : (Object.keys(override || []) as PayloadField[]);
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
  raw: RawEncryptionParameters,
  source?: PayloadSource
): PurePayload {
  const fields = Object.keys(raw) as PayloadField[];
  return CreatePayload(raw, fields, source);
}

export function CopyEncryptionParameters(
  raw: RawEncryptionParameters,
  override?: RawEncryptionParameters
): PurePayload {
  return CreatePayload(
    raw,
    EncryptionParametersFields.slice(),
    undefined,
    override
  );
}

function payloadFieldsForIntent(intent: EncryptionIntent) {
  if (
    intent === EncryptionIntent.FileEncrypted ||
    intent === EncryptionIntent.FileDecrypted ||
    intent === EncryptionIntent.FilePreferEncrypted
  ) {
    return FilePayloadFields.slice();
  }

  if (
    intent === EncryptionIntent.LocalStoragePreferEncrypted ||
    intent === EncryptionIntent.LocalStorageDecrypted ||
    intent === EncryptionIntent.LocalStorageEncrypted
  ) {
    return StoragePayloadFields.slice();
  }

  if (intent === EncryptionIntent.Sync) {
    return ServerPayloadFields.slice();
  } else {
    throw `No payload fields found for intent ${intent}`;
  }
}

export function payloadFieldsForSource(source: PayloadSource): PayloadField[] {
  if (source === PayloadSource.FileImport) {
    return FilePayloadFields.slice();
  }

  if (source === PayloadSource.SessionHistory) {
    return SessionHistoryPayloadFields.slice();
  }

  if (source === PayloadSource.RemoteHistory) {
    return RemoteHistoryPayloadFields.slice();
  }

  if (source === PayloadSource.ComponentRetrieved) {
    return ComponentRetrievedPayloadFields.slice();
  }

  if (source === PayloadSource.ComponentCreated) {
    return ComponentCreatedPayloadFields.slice();
  }

  if (
    source === PayloadSource.LocalRetrieved ||
    source === PayloadSource.LocalChanged
  ) {
    return StoragePayloadFields.slice();
  }

  if (
    source === PayloadSource.RemoteRetrieved ||
    source === PayloadSource.ConflictData ||
    source === PayloadSource.ConflictUuid ||
    source === PayloadSource.RemoteRejected
  ) {
    return ServerPayloadFields.slice();
  }
  if (
    source === PayloadSource.LocalSaved ||
    source === PayloadSource.RemoteSaved
  ) {
    return ServerSavedPayloadFields.slice();
  } else {
    throw `No payload fields found for source ${source}`;
  }
}

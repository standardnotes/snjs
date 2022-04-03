export enum PayloadField {
  Content = 'content',
  ContentType = 'content_type',
  CreatedAt = 'created_at',
  CreatedAtTimestamp = 'created_at_timestamp',
  Deleted = 'deleted',
  DirtiedDate = 'dirtiedDate',
  Dirty = 'dirty',
  DuplicateOf = 'duplicate_of',
  EncItemKey = 'enc_item_key',
  ErrorDecrypting = 'errorDecrypting',
  ErrorDecryptingChanged = 'errorDecryptingValueChanged',
  ItemsKeyId = 'items_key_id',
  LastSyncBegan = 'lastSyncBegan',
  LastSyncEnd = 'lastSyncEnd',
  Legacy003AuthHash = 'auth_hash',
  Legacy003AuthParams = 'auth_params',
  ServerUpdatedAt = 'updated_at',
  ServerUpdatedAtTimestamp = 'updated_at_timestamp',
  Uuid = 'uuid',
  WaitingForKey = 'waitingForKey',
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

export enum PayloadField {
  Uuid = 'uuid',
  ContentType = 'content_type',
  ItemsKeyId = 'items_key_id',
  EncItemKey = 'enc_item_key',
  Content = 'content',
  CreatedAt = 'created_at',
  ServerUpdatedAt = 'updated_at',
  CreatedAtTimestamp = 'created_at_timestamp',
  ServerUpdatedAtTimestamp = 'updated_at_timestamp',
  Deleted = 'deleted',
  Legacy003AuthHash = 'auth_hash',
  Legacy003AuthParams = 'auth_params',
  Dirty = 'dirty',
  DirtiedDate = 'dirtiedDate',
  WaitingForKey = 'waitingForKey',
  ErrorDecrypting = 'errorDecrypting',
  ErrorDecryptingChanged = 'errorDecryptingValueChanged',
  LastSyncBegan = 'lastSyncBegan',
  LastSyncEnd = 'lastSyncEnd',
  DuplicateOf = 'duplicate_of',
}

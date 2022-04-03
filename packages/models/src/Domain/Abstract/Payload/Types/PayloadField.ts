import { DeletedTransferPayload } from './../../TransferPayload/Interfaces/DeletedTransferPayload'
import { DecryptedTransferPayload } from '../../TransferPayload/Interfaces/DecryptedTransferPayload'
import { EncryptedTransferPayload } from './../../TransferPayload/Interfaces/EncryptedTransferPayload'
import { TransferPayload } from './../../TransferPayload/Interfaces/TransferPayload'

export type ValidPayloadKey =
  | keyof TransferPayload
  | keyof EncryptedTransferPayload
  | keyof DecryptedTransferPayload
  | keyof DeletedTransferPayload

export const PayloadField: Record<string, ValidPayloadKey> = {
  Content: 'content',
  ContentType: 'content_type',
  CreatedAt: 'created_at',
  CreatedAtTimestamp: 'created_at_timestamp',
  Deleted: 'deleted',
  DirtiedDate: 'dirtiedDate',
  Dirty: 'dirty',
  DuplicateOf: 'duplicate_of',
  EncItemKey: 'enc_item_key',
  ErrorDecrypting: 'errorDecrypting',
  ErrorDecryptingChanged: 'errorDecryptingValueChanged',
  ItemsKeyId: 'items_key_id',
  LastSyncBegan: 'lastSyncBegan',
  LastSyncEnd: 'lastSyncEnd',
  Legacy003AuthHash: 'auth_hash',
  Legacy003AuthParams: 'auth_params',
  ServerUpdatedAt: 'updated_at',
  ServerUpdatedAtTimestamp: 'updated_at_timestamp',
  Uuid: 'uuid',
  WaitingForKey: 'waitingForKey',
}

/** The MaxItemPayload represents a payload with all possible fields */
export const MaxPayloadFields: ValidPayloadKey[] = [
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
]

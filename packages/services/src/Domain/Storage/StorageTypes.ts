import {
  LocalStorageEncryptedContextualPayload,
  LocalStorageDecryptedContextualPayload,
} from '@standardnotes/models'

export enum StoragePersistencePolicies {
  Default = 1,
  Ephemeral = 2,
}

export enum StorageEncryptionPolicy {
  Default = 1,
  Disabled = 2,
}

export enum StorageValueModes {
  /** Stored inside wrapped encrpyed storage object */
  Default = 1,
  /** Stored outside storage object, unencrypted */
  Nonwrapped = 2,
}

export enum ValueModesKeys {
  /* Is encrypted */
  Wrapped = 'wrapped',
  /* Is decrypted */
  Unwrapped = 'unwrapped',
  /* Lives outside of wrapped/unwrapped */
  Nonwrapped = 'nonwrapped',
}

export type ValuesObjectRecord = Record<string, unknown>

export type WrappedStorageValue =
  | LocalStorageEncryptedContextualPayload
  | LocalStorageDecryptedContextualPayload

export type StorageValuesObject = {
  [ValueModesKeys.Wrapped]: WrappedStorageValue
  [ValueModesKeys.Unwrapped]: ValuesObjectRecord
  [ValueModesKeys.Nonwrapped]: ValuesObjectRecord
}

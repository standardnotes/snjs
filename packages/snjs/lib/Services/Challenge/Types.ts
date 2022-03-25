import { SNRootKey } from '@Lib/Protocol'

export type ChallengeRawValue = number | string | boolean

export enum ChallengeReason {
  AccessProtectedFile,
  AccessProtectedNote,
  AddPasscode,
  ApplicationUnlock,
  ChangeAutolockInterval,
  ChangePasscode,
  CreateDecryptedBackupWithProtectedItems,
  Custom,
  DecryptEncryptedFile,
  DisableBiometrics,
  DisableMfa,
  ExportBackup,
  ImportFile,
  Migration,
  ProtocolUpgrade,
  RemovePasscode,
  ResaveRootKey,
  RevokeSession,
  SearchProtectedNotesText,
  SelectProtectedNote,
  UnprotectFile,
  UnprotectNote,
  DeleteAccount,
}

export type ChallengeArtifacts = {
  wrappingKey?: SNRootKey
  rootKey?: SNRootKey
}

export enum ChallengeValidation {
  None = 0,
  LocalPasscode = 1,
  AccountPassword = 2,
  Biometric = 3,
  ProtectionSessionDuration = 4,
}

/** For mobile */
export enum ChallengeKeyboardType {
  Alphanumeric = 'default',
  Numeric = 'numeric',
}

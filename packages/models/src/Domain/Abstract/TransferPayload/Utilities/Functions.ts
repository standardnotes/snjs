import { ContentlessPayload } from './../../Payload/Implementations/ContentlessPayload'
import {
  ComponentCreatedPayloadFields,
  ComponentCreateTransferPayload,
} from '../Interfaces/Contextual/ComponentCreate'
import { PayloadSource } from './../../Payload/Types/PayloadSource'
import { DecryptedPayload } from '../../Payload/Implementations/DecryptedPayload'

import { isString } from '@standardnotes/utils'
import { EncryptedPayload } from '../../Payload/Implementations/EncryptedPayload'
import { EncryptedTransferPayload } from '../Interfaces/EncryptedTransferPayload'
import { DecryptedTransferPayload } from '../Interfaces/DecryptedTransferPayload'
import {
  ComponentRetrievedPayloadFields,
  ComponentRetrievedTransferPayload,
} from '../Interfaces/Contextual/ComponentRetrieved'
import { SyncSavedTransferPayload } from '../Interfaces/Contextual/ServerSaved'
import { FileImportTransferPayload, FilePayloadFields } from '../Interfaces/Contextual/FileImport'
import {
  LocalStorageTransferPayload,
  StoragePayloadFields,
} from '../Interfaces/Contextual/LocalStorage'
import {
  SessionHistoryPayloadFields,
  SessionHistoryTransferPayload,
} from '../Interfaces/Contextual/SessionHistory'
import {
  ServerPushOrRetrievedTransferPayload,
  ServerPushPayloadFields,
} from '../Interfaces/Contextual/ServerPushOrRetrieved'

export function CreateComponentRetrievedTransferPayload(
  object: ComponentRetrievedTransferPayload,
): ComponentRetrievedTransferPayload {
  return new DecryptedPayload(
    object,
    ComponentRetrievedPayloadFields.slice(),
    PayloadSource.ComponentRetrieved,
  )
}

export function CreateComponentCreateTransferPayload(
  object: ComponentCreateTransferPayload,
): ComponentCreateTransferPayload {
  return new DecryptedPayload(
    object,
    ComponentCreatedPayloadFields.slice(),
    PayloadSource.ComponentCreated,
  )
}

export function CreateSessionHistoryTransferPayload(
  object: SessionHistoryTransferPayload,
): SessionHistoryTransferPayload {
  return new DecryptedPayload(
    object,
    SessionHistoryPayloadFields.slice(),
    PayloadSource.SessionHistory,
  )
}

export function CreateRemoteHistoryTransferPayload(
  object: ServerPushOrRetrievedTransferPayload,
): ServerPushOrRetrievedTransferPayload {
  return new EncryptedPayload(object, ServerPushPayloadFields.slice(), PayloadSource.RemoteHistory)
}

export function CreateRemoteRetrievedTransferPayload(
  object: ServerPushOrRetrievedTransferPayload,
  source:
    | PayloadSource.RemoteRetrieved
    | PayloadSource.ConflictData
    | PayloadSource.ConflictUuid
    | PayloadSource.RemoteRejected,
): ServerPushOrRetrievedTransferPayload {
  return new EncryptedPayload(object, ServerPushPayloadFields.slice(), source)
}

export function CreateLocalSavedTransferPayload(
  object: SyncSavedTransferPayload,
): SyncSavedTransferPayload {
  return new ContentlessPayload(
    object,
    ComponentCreatedPayloadFields.slice(),
    PayloadSource.LocalSaved,
  )
}

export function CreateRemoteSavedTransferPayload(
  object: SyncSavedTransferPayload,
): SyncSavedTransferPayload {
  return new ContentlessPayload(
    object,
    ComponentCreatedPayloadFields.slice(),
    PayloadSource.RemoteSaved,
  )
}

export function CreateFileImportTransferPayload(
  object: FileImportTransferPayload,
): FileImportTransferPayload {
  if (isString(object.content)) {
    return new EncryptedPayload(
      object as EncryptedTransferPayload,
      FilePayloadFields.slice(),
      PayloadSource.FileImport,
    )
  } else {
    return new DecryptedPayload(
      object as DecryptedTransferPayload,
      FilePayloadFields.slice(),
      PayloadSource.FileImport,
    )
  }
}

export function CreateLocalStorageTransferPayload(
  object: LocalStorageTransferPayload,
): LocalStorageTransferPayload {
  return new EncryptedPayload(object, StoragePayloadFields.slice(), PayloadSource.ComponentCreated)
}

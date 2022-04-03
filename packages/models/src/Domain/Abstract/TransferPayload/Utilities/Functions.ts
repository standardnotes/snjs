import { DeletedPayload } from './../../Payload/Implementations/DeletedPayload'
import { isString } from '@standardnotes/utils'
import { ContentlessPayload } from './../../Payload/Implementations/ContentlessPayload'
import { ComponentCreateTransferPayload } from '../Interfaces/Contextual/ComponentCreate'
import { PayloadSource } from './../../Payload/Types/PayloadSource'
import { DecryptedPayload } from '../../Payload/Implementations/DecryptedPayload'
import { EncryptedPayload } from '../../Payload/Implementations/EncryptedPayload'
import { EncryptedTransferPayload } from '../Interfaces/EncryptedTransferPayload'
import { DecryptedTransferPayload } from '../Interfaces/DecryptedTransferPayload'
import { ComponentRetrievedTransferPayload } from '../Interfaces/Contextual/ComponentRetrieved'
import { SyncSavedTransferPayload } from '../Interfaces/Contextual/ServerSaved'
import { FileImportTransferPayload } from '../Interfaces/Contextual/FileImport'
import { LocalStorageTransferPayload } from '../Interfaces/Contextual/LocalStorage'
import { SessionHistoryTransferPayload } from '../Interfaces/Contextual/SessionHistory'
import { ServerPushOrRetrievedTransferPayload } from '../Interfaces/Contextual/ServerPushOrRetrieved'
import { isDeletedTransferPayload, isEncryptedTransferPayload } from '../Interfaces/TypeCheck'

export function CreateComponentRetrievedTransferPayload(
  object: ComponentRetrievedTransferPayload,
): ComponentRetrievedTransferPayload {
  return new DecryptedPayload(object, PayloadSource.ComponentRetrieved)
}

export function CreateComponentCreateTransferPayload(
  object: ComponentCreateTransferPayload,
): ComponentCreateTransferPayload {
  return new DecryptedPayload(object, PayloadSource.ComponentCreated)
}

export function CreateSessionHistoryTransferPayload(
  object: SessionHistoryTransferPayload,
): SessionHistoryTransferPayload {
  return new DecryptedPayload(object, PayloadSource.SessionHistory)
}

export function CreateRemoteHistoryTransferPayload(
  object: ServerPushOrRetrievedTransferPayload,
): ServerPushOrRetrievedTransferPayload {
  if (isDeletedTransferPayload(object)) {
    return new DeletedPayload(object, PayloadSource.RemoteHistory)
  } else if (isEncryptedTransferPayload(object)) {
    return new EncryptedPayload(object, PayloadSource.RemoteHistory)
  }
  throw Error('Unhandled case in CreateRemoteHistoryTransferPayload')
}

export function CreateRemoteRetrievedTransferPayload(
  object: ServerPushOrRetrievedTransferPayload,
  source:
    | PayloadSource.RemoteRetrieved
    | PayloadSource.ConflictData
    | PayloadSource.ConflictUuid
    | PayloadSource.RemoteRejected,
  override?: Partial<ServerPushOrRetrievedTransferPayload>,
): ServerPushOrRetrievedTransferPayload {
  if (isDeletedTransferPayload(object)) {
    return new DeletedPayload(object, source)
  } else if (isEncryptedTransferPayload(object)) {
    return new EncryptedPayload(
      {
        ...object,
        ...override,
      },
      source,
    )
  }
  throw Error('Unhandled case in CreateRemoteRetrievedTransferPayload')
}

export function CreateLocalSavedTransferPayload(
  object: SyncSavedTransferPayload,
): SyncSavedTransferPayload {
  return new ContentlessPayload(object, PayloadSource.LocalSaved)
}

export function CreateRemoteSavedTransferPayload(
  object: SyncSavedTransferPayload,
): SyncSavedTransferPayload {
  return new ContentlessPayload(object, PayloadSource.RemoteSaved)
}

export function CreateFileImportTransferPayload(
  object: FileImportTransferPayload,
): FileImportTransferPayload {
  if (isString(object.content)) {
    return new EncryptedPayload(object as EncryptedTransferPayload, PayloadSource.FileImport)
  } else {
    return new DecryptedPayload(object as DecryptedTransferPayload, PayloadSource.FileImport)
  }
}

export function CreateLocalStorageTransferPayload(
  object: LocalStorageTransferPayload,
): LocalStorageTransferPayload {
  return new EncryptedPayload(object, PayloadSource.ComponentCreated)
}

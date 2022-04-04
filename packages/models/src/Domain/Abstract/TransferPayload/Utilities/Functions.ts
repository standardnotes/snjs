import { DeletedPayload } from './../../Payload/Implementations/DeletedPayload'
import { isString } from '@standardnotes/utils'
import { ContentlessPayload } from './../../Payload/Implementations/ContentlessPayload'
import { ComponentCreateContextualPayload } from '../Interfaces/Contextual/ComponentCreate'
import { PayloadSource } from './../../Payload/Types/PayloadSource'
import { DecryptedPayload } from '../../Payload/Implementations/DecryptedPayload'
import { EncryptedPayload } from '../../Payload/Implementations/EncryptedPayload'
import { EncryptedTransferPayload } from '../Interfaces/EncryptedTransferPayload'
import { DecryptedTransferPayload } from '../Interfaces/DecryptedTransferPayload'
import { ComponentRetrievedContextualPayload } from '../Interfaces/Contextual/ComponentRetrieved'
import { SyncSavedContextualPayload } from '../Interfaces/Contextual/ServerSaved'
import { FileImportContextualPayload } from '../Interfaces/Contextual/FileImport'
import { LocalStorageEncryptedContextualPayload } from '../Interfaces/Contextual/LocalStorage'
import { SessionHistoryContextualPayload } from '../Interfaces/Contextual/SessionHistory'
import { ServerSyncContextualPayload } from '../Interfaces/Contextual/ServerSync'
import { isDeletedTransferPayload, isEncryptedTransferPayload } from '../Interfaces/TypeCheck'
import { LocalStorageDecryptedContextualPayload } from '../Interfaces/Contextual/LocalStorage'
import { FileEncryptedExportContextualPayload } from '../Interfaces/Contextual/FileExport'

export function CreateComponentRetrievedPayload(
  object: ComponentRetrievedContextualPayload,
): DecryptedPayload {
  return new DecryptedPayload(object, PayloadSource.ComponentRetrieved)
}

export function CreateComponentCreatePayload(
  object: ComponentCreateContextualPayload,
): DecryptedPayload {
  return new DecryptedPayload(object, PayloadSource.ComponentCreated)
}

export function CreateSessionHistoryPayload(
  object: SessionHistoryContextualPayload,
): DecryptedPayload {
  return new DecryptedPayload(object, PayloadSource.SessionHistory)
}

export function CreateRemoteHistoryPayload(
  object: ServerSyncContextualPayload,
): DeletedPayload | EncryptedPayload {
  if (isDeletedTransferPayload(object)) {
    return new DeletedPayload(object, PayloadSource.RemoteHistory)
  } else if (isEncryptedTransferPayload(object)) {
    return new EncryptedPayload(object, PayloadSource.RemoteHistory)
  }
  throw Error('Unhandled case in CreateRemoteHistoryTransferPayload')
}

export function CreateServerPushPayload(
  object: ServerSyncContextualPayload,
): EncryptedPayload | DeletedPayload {
  if (isDeletedTransferPayload(object)) {
    return new DeletedPayload(object)
  } else if (isEncryptedTransferPayload(object)) {
    return new EncryptedPayload(object)
  }
  throw Error('Unhandled case in CreateServerPushPayload')
}

export function CreateRemoteRetrievedPayload(
  object: ServerSyncContextualPayload,
  source:
    | PayloadSource.RemoteRetrieved
    | PayloadSource.ConflictData
    | PayloadSource.ConflictUuid
    | PayloadSource.RemoteRejected,
  override?: Partial<ServerSyncContextualPayload>,
): DeletedPayload | EncryptedPayload {
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

export function CreateLocalSavedPayload(object: SyncSavedContextualPayload): ContentlessPayload {
  return new ContentlessPayload(object, PayloadSource.LocalSaved)
}

export function CreateRemoteSavedPayload(object: SyncSavedContextualPayload): ContentlessPayload {
  return new ContentlessPayload(object, PayloadSource.RemoteSaved)
}

export function CreateFileImportPayload(
  object: FileImportContextualPayload,
): EncryptedPayload | DecryptedPayload {
  if (isString(object.content)) {
    return new EncryptedPayload(object as EncryptedTransferPayload, PayloadSource.FileImport)
  } else {
    return new DecryptedPayload(object as DecryptedTransferPayload, PayloadSource.FileImport)
  }
}

export function CreateEncryptedFileExportPayload(
  object: FileEncryptedExportContextualPayload,
): EncryptedPayload {
  return new EncryptedPayload(object as EncryptedTransferPayload, PayloadSource.FileImport)
}

export function CreateLocalStorageEncryptedPayload(
  object: LocalStorageEncryptedContextualPayload,
): EncryptedPayload {
  return new EncryptedPayload(object, PayloadSource.ComponentCreated)
}

export function CreateLocalStorageDecryptedPayload(
  object: LocalStorageDecryptedContextualPayload,
): DecryptedPayload {
  return new DecryptedPayload(object, PayloadSource.ComponentCreated)
}

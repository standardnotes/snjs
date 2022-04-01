import { DeltaRemoteRejected } from './RemoteRejected'
import { DeltaRemoteConflicts } from './RemoteConflicts'
import { DeltaRemoteSaved } from './RemoteSaved'
import { DeltaRemoteRetrieved } from './RemoteRetrieved'
import { PayloadSource } from '../Payload/PayloadSource'

export function DeltaClassForSource(source: PayloadSource) {
  if (source === PayloadSource.RemoteRetrieved) {
    return DeltaRemoteRetrieved
  } else if (source === PayloadSource.RemoteSaved) {
    return DeltaRemoteSaved
  } else if (source === PayloadSource.ConflictData || source === PayloadSource.ConflictUuid) {
    return DeltaRemoteConflicts
  } else if (source === PayloadSource.RemoteRejected) {
    return DeltaRemoteRejected
  } else {
    throw `No delta class found for source ${PayloadSource[source]}`
  }
}

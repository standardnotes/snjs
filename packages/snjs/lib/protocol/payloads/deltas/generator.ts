import { DeltaRemoteRejected } from './remote_rejected';
import { DeltaRemoteConflicts } from './remote_conflicts';
import { DeltaRemoteSaved } from './remote_saved';
import { DeltaRemoteRetrieved } from './remote_retrieved';
import { PayloadSource } from '@Payloads/sources';

export function DeltaClassForSource(source: PayloadSource) {
  if (source === PayloadSource.RemoteRetrieved) {
    return DeltaRemoteRetrieved;
  } else if (source === PayloadSource.RemoteSaved) {
    return DeltaRemoteSaved;
  } else if (
    source === PayloadSource.ConflictData ||
    source === PayloadSource.ConflictUuid
  ) {
    return DeltaRemoteConflicts;
  } else if (source === PayloadSource.RemoteRejected) {
    return DeltaRemoteRejected;
  } else {
    throw `No delta class found for source ${PayloadSource[source]}`;
  }
}

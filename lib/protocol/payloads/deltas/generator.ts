import { PayloadSource } from '@Payloads/sources';
import {
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteConflicts
} from './index';

export function DeltaClassForSource(source: PayloadSource) {
  if(source === PayloadSource.RemoteRetrieved) {
    return DeltaRemoteRetrieved;
  } else if(source === PayloadSource.RemoteSaved) {
    return DeltaRemoteSaved;
  } else if((
    source === PayloadSource.ConflictData ||
    source === PayloadSource.ConflictUuid
  )) {
    return DeltaRemoteConflicts;
  }
}

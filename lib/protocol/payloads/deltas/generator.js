import * as sources from '@Payloads/sources';
import {
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteConflicts
} from './index';

export function DeltaClassForSource(source) {
  if(source === PayloadSoures.RemoteRetrieved) {
    return DeltaRemoteRetrieved;
  } else if(source === PayloadSoures.RemoteSaved) {
    return DeltaRemoteSaved;
  } else if((
    source === PayloadSoures.ConflictData ||
    source === PayloadSoures.ConflictUuid
  )) {
    return DeltaRemoteConflicts;
  }
}

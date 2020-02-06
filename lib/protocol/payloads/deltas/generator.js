import { PayloadSources } from '@Payloads';
import {
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteConflicts
} from './index';

export function DeltaClassForSource(source) {
  if(source === PayloadSources.RemoteRetrieved) {
    return DeltaRemoteRetrieved;
  } else if(source === PayloadSources.RemoteSaved) {
    return DeltaRemoteSaved;
  } else if((
    source === PayloadSources.ConflictData ||
    source === PayloadSources.ConflictUuid
  )) {
    return DeltaRemoteConflicts;
  }
}

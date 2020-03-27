import { PayloadSources } from '@Payloads/sources';
import {
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteConflicts
} from './index';

export function DeltaClassForSource(source: PayloadSources) {
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

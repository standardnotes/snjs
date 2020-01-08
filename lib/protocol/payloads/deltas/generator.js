import * as sources from '@Protocol/payloads/sources';
import {
  DeltaRemoteRetrieved,
  DeltaRemoteSaved,
  DeltaRemoteConflicts
} from './index';

export function DeltaClassForSource(source) {
  if(source === sources.PAYLOAD_SOURCE_REMOTE_RETRIEVED) {
    return DeltaRemoteRetrieved;
  } else if(source === sources.PAYLOAD_SOURCE_REMOTE_SAVED) {
    return DeltaRemoteSaved;
  } else if((
    source === sources.PAYLOAD_SOURCE_CONFLICT_DATA ||
    source === sources.PAYLOAD_SOURCE_CONFLICT_UUID
  )) {
    return DeltaRemoteConflicts;
  }
}

import {DeltaRemoteRetrieved, DeltaRemoteSaved} from './index';

export function DeltaClassForSource(source) {
  if(source === PAYLOAD_SOURCE_REMOTE_RETRIEVED) {
    return DeltaRemoteRetrieved;
  } else if(source === PAYLOAD_SOURCE_REMOTE_SAVED) {
    return DeltaRemoteSaved;
  }
}

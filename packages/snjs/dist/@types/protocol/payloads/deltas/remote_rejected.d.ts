import { PayloadsDelta } from './delta';
import { ImmutablePayloadCollection } from '../../collection/payload_collection';
export declare class DeltaRemoteRejected extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
}

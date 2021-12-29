import { PayloadsDelta } from '../../../../../protocol/payloads/deltas/delta';
import { ImmutablePayloadCollection } from '../../../../../protocol/collection/payload_collection';
export declare class DeltaRemoteSaved extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
}

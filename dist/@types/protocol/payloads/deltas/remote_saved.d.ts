import { PayloadsDelta } from './delta';
import { ImmutablePayloadCollection } from "../../collection/payload_collection";
export declare class DeltaRemoteSaved extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
}

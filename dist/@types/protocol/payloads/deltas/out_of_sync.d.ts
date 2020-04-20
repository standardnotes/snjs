import { PayloadsDelta } from './delta';
import { ImmutablePayloadCollection } from "../../collection/payload_collection";
export declare class DeltaOutOfSync extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
}

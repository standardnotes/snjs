import { SinglePayloadDelta } from './single_payload_delta';
import { ImmutablePayloadCollection } from "../../collection/payload_collection";
export declare class ConflictDelta extends SinglePayloadDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
    private payloadsByHandlingStrategy;
}

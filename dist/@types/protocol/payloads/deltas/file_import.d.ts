import { PayloadsDelta } from './delta';
import { ImmutablePayloadCollection } from "../../collection/payload_collection";
export declare class DeltaFileImport extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
    private payloadsByHandlingPayload;
}

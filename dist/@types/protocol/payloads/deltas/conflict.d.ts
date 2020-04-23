import { PayloadSource } from './../sources';
import { PurePayload } from './../pure_payload';
import { ImmutablePayloadCollection } from "../../collection/payload_collection";
export declare class ConflictDelta {
    protected readonly baseCollection: ImmutablePayloadCollection;
    protected readonly basePayload: PurePayload;
    protected readonly applyPayload: PurePayload;
    protected readonly source: PayloadSource;
    constructor(baseCollection: ImmutablePayloadCollection, basePayload: PurePayload, applyPayload: PurePayload, source: PayloadSource);
    resultingCollection(): Promise<ImmutablePayloadCollection>;
    private payloadsByHandlingStrategy;
}

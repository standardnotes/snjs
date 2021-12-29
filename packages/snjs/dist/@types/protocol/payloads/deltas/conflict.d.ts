import { PayloadSource } from './../sources';
import { PurePayload } from './../pure_payload';
import { ImmutablePayloadCollection } from '../../collection/payload_collection';
export declare class ConflictDelta {
    protected readonly baseCollection: ImmutablePayloadCollection;
    protected readonly basePayload: PurePayload;
    protected readonly applyPayload: PurePayload;
    protected readonly source: PayloadSource;
    protected readonly historyMap?: Record<string, import("../../..").HistoryEntry[]> | undefined;
    constructor(baseCollection: ImmutablePayloadCollection, basePayload: PurePayload, applyPayload: PurePayload, source: PayloadSource, historyMap?: Record<string, import("../../..").HistoryEntry[]> | undefined);
    resultingCollection(): Promise<ImmutablePayloadCollection>;
    private payloadsByHandlingStrategy;
}

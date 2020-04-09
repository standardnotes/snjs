import { PayloadsDelta } from './delta';
import { ImmutablePayloadCollection } from '../collection';
export declare class DeltaOutOfSync extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
}

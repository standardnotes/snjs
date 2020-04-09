import { PayloadsDelta } from './delta';
import { ImmutablePayloadCollection } from '../collection';
export declare class DeltaRemoteSaved extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
}

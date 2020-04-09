import { PayloadsDelta } from './delta';
import { ImmutablePayloadCollection } from '../collection';
export declare class DeltaRemoteRetrieved extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
    private findConflictOf;
}

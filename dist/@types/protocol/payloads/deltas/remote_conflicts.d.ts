import { PayloadsDelta } from './delta';
import { ImmutablePayloadCollection } from '../collection';
export declare class DeltaRemoteConflicts extends PayloadsDelta {
    resultingCollection(): Promise<ImmutablePayloadCollection>;
    private collectionsByHandlingDataConflicts;
    /**
     * UUID conflicts can occur if a user attmpts to import an old data
     * backup with uuids from the old account into a new account.
     * In uuid_conflict, we receive the value we attmpted to save.
     */
    private collectionsByHandlingUuidConflicts;
}

import { Migration } from './migration';
export declare class BaseMigration extends Migration {
    protected registerStageHandlers(): void;
    /**
     * In Snjs 1.x, and Snjs 2.0.0, version numbers were not stored (as they were introduced
     * in 2.0.1). Because migrations can now rely on this value, we want to establish a base
     * value if we do not find it in storage.
     */
    private storeVersionNumber;
}

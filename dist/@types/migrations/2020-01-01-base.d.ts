import { Migration } from './migration';
export declare class BaseMigration extends Migration {
    static timestamp(): number;
    protected registerStageHandlers(): void;
    /**
     * Establish last_migration_date.
     * We need to determine if this is a new application download,
     * or if we're coming from an older, non-current client.
     *
     * If new application download, we expect last_migration_date
     * to be null. However, last_migration_date can also be null if you
     * haven't yet migration to using this system.
     *
     * So in addition to this date being null, we check if deviceInterface
     * has pre-existing storage values for old migration system.
     * If so, this means this is a legacy client making its first jump to
     * this new migration system.
     */
    private migrateMigrationTimestampAllPlatforms;
}

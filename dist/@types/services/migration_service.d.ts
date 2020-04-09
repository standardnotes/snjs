import { MigrationServices } from './../migrations/types';
import { MigrationChallengeHandler } from './../migrations/migration';
import { ApplicationEvents, ApplicationStages } from '../index';
import { PureService } from './pure_service';
/**
 * The migration service orchestrates the execution of multi-stage migrations.
 * Migrations are registered during initial application launch, and listen for application
 * life-cycle events, and act accordingly. For example, a single migration may perform
 * a unique set of steps when the application first launches, and also other steps after the
 * application is unlocked, or after the first sync completes. Migrations live under /migrations
 * and inherit from the base Migration class.
 */
export declare class SNMigrationService extends PureService {
    private challengeResponder?;
    private activeMigrations?;
    private services?;
    private handledFullSyncStage;
    constructor(services: MigrationServices, challengeResponder: MigrationChallengeHandler);
    deinit(): void;
    initialize(): Promise<void>;
    /**
     * Application instances will call this function directly when they arrive
     * at a certain migratory state.
     */
    handleApplicationStage(stage: ApplicationStages): Promise<void>;
    /**
     * Called by application
     */
    handleApplicationEvent(event: ApplicationEvents): Promise<void>;
    private runBaseMigration;
    private getRequiredMigrations;
    /** @access private */
    getTimeStampKey(): string;
    private getLastMigrationTimestamp;
    private saveLastMigrationTimestamp;
    private handleStage;
}

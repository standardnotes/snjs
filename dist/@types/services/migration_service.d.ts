import { ApplicationEvent } from './../events';
import { ApplicationStage } from '../stages';
import { MigrationServices } from './../migrations/types';
import { PureService } from './pure_service';
/**
 * The migration service orchestrates the execution of multi-stage migrations.
 * Migrations are registered during initial application launch, and listen for application
 * life-cycle events, and act accordingly. Migrations operate on the app-level, and not global level.
 * For example, a single migration may perform a unique set of steps when the application
 * first launches, and also other steps after the application is unlocked, or after the
 * first sync completes. Migrations live under /migrations and inherit from the base Migration class.
 */
export declare class SNMigrationService extends PureService {
    private services;
    private activeMigrations?;
    private handledFullSyncStage;
    constructor(services: MigrationServices);
    deinit(): void;
    initialize(): Promise<void>;
    /**
     * Application instances will call this function directly when they arrive
     * at a certain migratory state.
     */
    handleApplicationStage(stage: ApplicationStage): Promise<void>;
    /**
     * Called by application
     */
    handleApplicationEvent(event: ApplicationEvent): Promise<void>;
    private runBaseMigration;
    private getRequiredMigrations;
    private getNamespacedTimeStampKey;
    private getLastMigrationTimestamp;
    private saveLastMigrationTimestamp;
    private handleStage;
}

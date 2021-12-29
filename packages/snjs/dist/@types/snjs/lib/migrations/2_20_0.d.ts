import { Migration } from '../../../migrations/migration';
export declare class Migration2_20_0 extends Migration {
    static version(): string;
    protected registerStageHandlers(): void;
    private deleteMfaItems;
}

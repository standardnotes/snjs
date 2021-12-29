import { Migration } from './migration';
export declare class Migration2_7_0 extends Migration {
    static version(): string;
    protected registerStageHandlers(): void;
    private deleteBatchManagerSingleton;
}

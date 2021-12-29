import { Migration } from './migration';
export declare class Migration2_0_15 extends Migration {
    static version(): string;
    protected registerStageHandlers(): void;
    private createNewDefaultItemsKeyIfNecessary;
}

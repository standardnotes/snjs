import { MigrationServices } from './types';
import { ApplicationStage } from '../stages';
declare type StageHandler = () => Promise<void>;
export declare abstract class Migration {
    protected services: MigrationServices;
    private stageHandlers;
    private onDoneHandler?;
    constructor(services: MigrationServices);
    static timestamp(): number;
    protected abstract registerStageHandlers(): void;
    protected registerStageHandler(stage: ApplicationStage, handler: StageHandler): void;
    protected markDone(): void;
    protected promptForPasscodeUntilCorrect(validationCallback: (passcode: string) => Promise<boolean>): Promise<unknown>;
    onDone(callback: () => void): void;
    handleStage(stage: ApplicationStage): Promise<void>;
}
export {};

import { MigrationServices } from './types';
import { OrchestratorFill } from './../services/challenge_service';
import { ApplicationStage } from '../stages';
import { Challenge, ChallengeResponse } from '../challenges';
declare type StageHandler = () => Promise<void>;
export declare type MigrationChallengeHandler = (challenge: Challenge, validate: boolean, orchestratorFill: OrchestratorFill) => Promise<ChallengeResponse>;
export declare abstract class Migration {
    protected services: MigrationServices;
    private challengeResponder?;
    private stageHandlers;
    private onDoneHandler?;
    constructor(services: MigrationServices, challengeResponder?: MigrationChallengeHandler);
    static timestamp(): number;
    protected abstract registerStageHandlers(): void;
    protected registerStageHandler(stage: ApplicationStage, handler: StageHandler): void;
    protected markDone(): void;
    onDone(callback: () => void): void;
    handleStage(stage: ApplicationStage): Promise<void>;
    protected requestChallengeResponse(challenge: Challenge, validate: boolean, orchestratorFill: OrchestratorFill): Promise<ChallengeResponse>;
}
export {};

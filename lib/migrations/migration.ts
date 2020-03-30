import { MigrationServices } from './types';
import { OrchestratorFill } from './../services/challenge_service';
import { SNApplication } from '../application';
import { ApplicationStages } from '../stages';
import { Challenge, ChallengeResponse } from '../challenges';

type StageHandler = () => Promise<void>

export type MigrationChallengeHandler = (
  challenge: Challenge,
  validate: boolean,
  orchestratorFill: OrchestratorFill
) => Promise<ChallengeResponse>

export abstract class Migration {

  protected services: MigrationServices
  private challengeResponder?: MigrationChallengeHandler
  private stageHandlers: Partial<Record<ApplicationStages, StageHandler>> = {}
  private onDoneHandler?: () => void

  constructor(
    services: MigrationServices,
    challengeResponder?: MigrationChallengeHandler
    ) {
    this.services = services;
    this.challengeResponder = challengeResponder;
    this.registerStageHandlers();
  }

  public static timestamp(): number {
    throw 'Must override';
  }

  protected abstract registerStageHandlers(): void;

  protected registerStageHandler(stage: ApplicationStages, handler: StageHandler) {
    this.stageHandlers[stage] = handler;
  }

  protected markDone() {
    this.onDoneHandler && this.onDoneHandler();
    this.onDoneHandler = undefined;
  }

  onDone(callback: () => void) {
    this.onDoneHandler = callback;
  }

  async handleStage(stage: ApplicationStages) {
    const handler = this.stageHandlers[stage];
    if (handler) {
      await handler();
    }
  }

  protected async requestChallengeResponse(
    challenge: Challenge,
    validate: boolean,
    orchestratorFill: OrchestratorFill
  ) {
    return this.challengeResponder!(challenge, validate, orchestratorFill);
  }
}

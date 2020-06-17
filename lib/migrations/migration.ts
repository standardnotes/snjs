import { MigrationServices } from './types';
import { ApplicationStage } from '../stages';

type StageHandler = () => Promise<void>

export abstract class Migration {
  private stageHandlers: Partial<Record<ApplicationStage, StageHandler>> = {}
  private onDoneHandler?: () => void

  constructor(protected services: MigrationServices) {
    this.registerStageHandlers();
  }

  public static timestamp(): number {
    throw 'Must override';
  }

  protected abstract registerStageHandlers(): void;

  protected registerStageHandler(stage: ApplicationStage, handler: StageHandler) {
    this.stageHandlers[stage] = handler;
  }

  protected markDone() {
    this.onDoneHandler?.();
    this.onDoneHandler = undefined;
  }

  onDone(callback: () => void) {
    this.onDoneHandler = callback;
  }

  async handleStage(stage: ApplicationStage) {
    const handler = this.stageHandlers[stage];
    if (handler) {
      await handler();
    }
  }
}

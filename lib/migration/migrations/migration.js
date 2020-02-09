export class Migration {
  constructor({application, challengeResponder}) {
    this.application = application;
    this.challengeResponder = challengeResponder;
    this.stageHandlers = {};
    this.registerStageHandlers();
  }

  /** @public */
  static timestamp() {
    throw 'Must override Migration.timestamp';
  }

  /** @protected */
  registerStageHandlers() {
    throw 'Must override Migration.registerStageHandlers';
  }

  /** @protected */
  registerStageHandler(stage, handler) {
    this.stageHandlers[stage] = handler;
  }

  /** @protected */
  markDone() {
    this.done = true;
    this.onDoneHandler && this.onDoneHandler();
    this.onDoneHandler = null;
  }

  onDone(callback) {
    this.onDoneHandler = callback;
  }

  /** @public */
  async handleStage(stage) {
    const handler = this.stageHandlers[stage];
    if(handler) {
      await handler();
    }
  }

  /** @protected */
  async requestChallengeResponse(challenge) {
    return this.challengeResponder(challenge);
  }
}

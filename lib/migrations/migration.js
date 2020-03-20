export class Migration {
  constructor({application, challengeResponder}) {
    this.application = application;
    this.challengeResponder = challengeResponder;
    this.stageHandlers = {};
    this.registerStageHandlers();
  }

  /** @access public */
  static timestamp() {
    throw 'Must override Migration.timestamp';
  }

  /** @access protected */
  registerStageHandlers() {
    throw 'Must override Migration.registerStageHandlers';
  }

  /** @access protected */
  registerStageHandler(stage, handler) {
    this.stageHandlers[stage] = handler;
  }

  /** @access protected */
  markDone() {
    this.done = true;
    this.onDoneHandler && this.onDoneHandler();
    this.onDoneHandler = null;
  }

  onDone(callback) {
    this.onDoneHandler = callback;
  }

  /** @access public */
  async handleStage(stage) {
    const handler = this.stageHandlers[stage];
    if(handler) {
      await handler();
    }
  }

  /** @access protected */
  async requestChallengeResponse(challenge, validate, orchestratorFill) {
    return this.challengeResponder(challenge, validate, orchestratorFill);
  }
}

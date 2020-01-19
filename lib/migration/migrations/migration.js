import {
  PLATFORM_MOBILE,
  PLATFORM_WEB,
  PLATFORM_DESKTOP,
  isPlatformWebOrDesktop,
  isPlatformMobile,
} from '@Lib/platforms';

export class Migration {
  static timestamp() {
    throw 'Must override Migration.timestamp';
  }

  constructor({application, challengeResponder}) {
    this.application = application;
    this.challengeResponder = challengeResponder;
  }

  async requestChallengeResponse(challenge) {
    return this.challengeResponder(challenge);
  }

  async handleStage(stage) {
    await this.handleStageAll(stage);
    if(isPlatformWebOrDesktop(this.application.platform)) {
      await this.handleStageDesktopWeb(stage);
    } else if(isPlatformMobile(this.application.platform)) {
      await this.handleStageMobile(stage);
    }
  }
}

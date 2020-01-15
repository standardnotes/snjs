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

  static async handleStage({
    application,
    stage,
    platform,
    deviceInterface
  }) {
    await this.handleStageAll({stage, application, deviceInterface});
    if(isPlatformWebOrDesktop(platform)) {
      await this.handleStageDesktopWeb({stage, application, deviceInterface});
    } else if(isPlatformMobile(platform)) {
      await this.handleStageMobile({stage, application, deviceInterface});
    }
  }
}

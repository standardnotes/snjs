import { ApplicationStage } from '../stages';
import { Migration } from '@Lib/migrations/migration';
import { ContentType } from '@Lib/models';
import { SettingName } from '@Lib/../../settings/dist';

export class Migration2_7_23 extends Migration {
  static version(): string {
    return '2.7.23';
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(ApplicationStage.SignedIn_30, async () => {
      await this.updateExtensionKeyUserSetting();
      this.markDone();
    });
  }

  private async updateExtensionKeyUserSetting() {
    const extensionRepos = this.services.itemManager.getItems(ContentType.ExtensionRepo);
    for (const extensionRepo of extensionRepos) {
      if (extensionRepo.safeContent.package_info) {
        const repoUrl: string = extensionRepo.safeContent.package_info.url;
        const userKeyMatch = repoUrl.match(/\w{32,64}/);
        if (userKeyMatch && userKeyMatch.length > 0) {
          const userKey = userKeyMatch[0];
          await this.services.settingsService.settings().updateSetting(SettingName.ExtensionKey, userKey);
        }
      }
    }
  }
}

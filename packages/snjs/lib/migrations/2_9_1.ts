import { ApplicationStage } from '../stages';
import { Migration } from '@Lib/migrations/migration';
import { ContentType } from '@Lib/models';

export class Migration2_9_1 extends Migration {
  static version(): string {
    return '2.9.1';
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(ApplicationStage.FullSyncCompleted_13, async () => {
      await this.updateExtensionKeyUserSetting();
      this.markDone();
    });
  }

  private async updateExtensionKeyUserSetting() {
    const session = this.services.sessionManager.getSession();
    if (session) {
      const extensionRepoItems = this.services.itemManager.getItems(ContentType.ExtensionRepo);
      await this.services.featuresService.updateExtensionKeySetting(extensionRepoItems);
    }
  }
}

import { ApplicationStage } from '../stages';
import { Migration } from '@Lib/migrations/migration';
import { SNItem, SNTheme } from '@Lib/models';
import { ContentType, FeatureIdentifier } from '..';

export class Migration2_42_0 extends Migration {
  static version(): string {
    return '2.42.0';
  }

  protected registerStageHandlers(): void {
    const handler = async () => {
      await this.deleteNoDistraction();
      this.markDone();
    };

    this.registerStageHandler(ApplicationStage.FullSyncCompleted_13, handler);
  }

  private async deleteNoDistraction(): Promise<void> {
    const themes = this.services.itemManager.getItems(
      ContentType.Theme
    ) as SNTheme[];
    const noDistractionIdentifier = 'org.standardnotes.theme-no-distraction' as FeatureIdentifier;
    const noDistractionTheme = themes.find(
      (theme) => theme.package_info.identifier === noDistractionIdentifier
    ) as SNItem;
    if (noDistractionTheme) {
      await this.services.itemManager.setItemToBeDeleted(
        noDistractionTheme.uuid
      );
    }
  }
}

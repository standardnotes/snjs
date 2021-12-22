import { ApplicationStage } from '../stages';
import { Migration } from '@Lib/migrations/migration';
import { ContentType, SNItem, SNTheme } from '@Lib/models';
import { FeatureIdentifier } from '..';

export class Migration2_25_4 extends Migration {
  static version(): string {
    return '2.25.4';
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(ApplicationStage.LoadedDatabase_12, async () => {
      await this.deleteNoDistraction();
      this.markDone();
    });
  }

  private async deleteNoDistraction(): Promise<void> {
    const themes = this.services.itemManager.getItems(
      ContentType.Theme
    ) as SNTheme[];
    const noDistractionIdentifier =
      'org.standardnotes.theme-no-distraction' as FeatureIdentifier;
    const noDistractionTheme = themes.find(
      (theme) => theme.package_info.identifier === noDistractionIdentifier
    ) as SNItem;
    if (noDistractionTheme) {
      await this.services.itemManager.setItemToBeDeleted(
        noDistractionTheme.uuid
      );
      await this.services.storageService.deletePayloadWithId(
        noDistractionTheme.uuid
      );
    }
  }
}

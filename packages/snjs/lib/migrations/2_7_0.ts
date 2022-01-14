import { ApplicationStage } from '../stages';
import { Migration } from '@Lib/migrations/migration';
import { SNPredicate } from '@Lib/models';
import { ContentType } from '@standardnotes/common';

export class Migration2_7_0 extends Migration {
  static version(): string {
    return '2.7.0';
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(ApplicationStage.FullSyncCompleted_13, async () => {
      await this.deleteBatchManagerSingleton();
      this.markDone();
    });
  }

  private async deleteBatchManagerSingleton() {
    const batchMgrId = 'org.standardnotes.batch-manager';
    const batchMgrPred = SNPredicate.CompoundPredicate([
      new SNPredicate('content_type', '=', ContentType.Component),
      new SNPredicate('package_info.identifier', '=', batchMgrId)
    ]);
    const batchMgrSingleton = this.services.singletonManager.findSingleton(batchMgrPred);
    if (batchMgrSingleton) {
      await this.services.itemManager.setItemToBeDeleted(batchMgrSingleton.uuid);
    }
  }
}

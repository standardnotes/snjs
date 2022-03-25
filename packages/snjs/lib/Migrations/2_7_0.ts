import { CompoundPredicate, Predicate } from '@standardnotes/payloads'
import { SNComponent } from '../Models/Component/Component'
import { Migration } from '@Lib/Migrations/migration'
import { ContentType } from '@standardnotes/common'
import { ApplicationStage } from '@standardnotes/applications'

export class Migration2_7_0 extends Migration {
  static version(): string {
    return '2.7.0'
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(ApplicationStage.FullSyncCompleted_13, async () => {
      await this.deleteBatchManagerSingleton()
      this.markDone()
    })
  }

  private async deleteBatchManagerSingleton() {
    const batchMgrId = 'org.standardnotes.batch-manager'
    const batchMgrPred = new CompoundPredicate('and', [
      new Predicate<SNComponent>('content_type', '=', ContentType.Component),
      new Predicate<SNComponent>('identifier', '=', batchMgrId),
    ])
    const batchMgrSingleton = this.services.singletonManager.findSingleton(
      ContentType.Component,
      batchMgrPred,
    )
    if (batchMgrSingleton) {
      await this.services.itemManager.setItemToBeDeleted(batchMgrSingleton.uuid)
    }
  }
}

import { SNComponent } from './../models/app/component';
import { Migration } from '@Lib/migrations/migration';
import { SNPredicate } from '@Lib/models';
import { ContentType } from '@standardnotes/common';
import { ApplicationStage } from '@standardnotes/applications';
import { PredicateOperator } from '@Lib/models/core/predicate';

export class Migration2_7_0 extends Migration {
  static version(): string {
    return '2.7.0';
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(
      ApplicationStage.FullSyncCompleted_13,
      async () => {
        await this.deleteBatchManagerSingleton();
        this.markDone();
      }
    );
  }

  private async deleteBatchManagerSingleton() {
    const batchMgrId = 'org.standardnotes.batch-manager';
    const batchMgrPred = SNPredicate.CompoundPredicate([
      new SNPredicate(
        'content_type',
        PredicateOperator.Equals,
        ContentType.Component
      ),
      new SNPredicate<SNComponent>(
        'package_info.identifier' as never,
        PredicateOperator.Equals,
        batchMgrId
      ),
    ]);
    const batchMgrSingleton = this.services.singletonManager.findSingleton(
      ContentType.Component,
      batchMgrPred
    );
    if (batchMgrSingleton) {
      await this.services.itemManager.setItemToBeDeleted(
        batchMgrSingleton.uuid
      );
    }
  }
}

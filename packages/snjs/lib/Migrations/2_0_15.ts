import { ApplicationStage } from '@standardnotes/applications'
import { Migration } from '@Lib/Migrations/migration'

export class Migration2_0_15 extends Migration {
  static version(): string {
    return '2.0.15'
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(ApplicationStage.LoadedDatabase_12, async () => {
      await this.createNewDefaultItemsKeyIfNecessary()
      this.markDone()
    })
  }

  private async createNewDefaultItemsKeyIfNecessary() {
    if (this.services.protocolService.needsNewRootKeyBasedItemsKey()) {
      await this.services.protocolService.rootKeyEncryption.createNewDefaultItemsKey()
    }
  }
}

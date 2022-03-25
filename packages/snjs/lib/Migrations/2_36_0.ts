import { Migration } from '@Lib/Migrations/migration'
import { ContentType } from '@standardnotes/common'
import { ApplicationStage } from '@standardnotes/applications'

export class Migration2_36_0 extends Migration {
  static version(): string {
    return '2.36.0'
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(ApplicationStage.LoadedDatabase_12, async () => {
      await this.removeServerExtensionsLocally()
      this.markDone()
    })
  }

  private async removeServerExtensionsLocally(): Promise<void> {
    const contentType = 'SF|Extension' as ContentType
    const items = this.services.itemManager.getItems(contentType)
    for (const item of items) {
      this.services.itemManager.removeItemLocally(item)
      await this.services.storageService.deletePayloadWithId(item.uuid)
    }
  }
}

import { Migration } from '@Lib/migrations/migration';
import { SNTag, TagMutator } from '@Lib/models';
import { ComponentArea } from '@Lib/models/app/component';
import { ItemManager } from '@Lib/services';
import { lastElement, sortByKey, withoutLastElement } from '@Lib/utils';
import { ContentType } from '@standardnotes/common';
import { ApplicationStage } from '../../stages';

export class TagsToFoldersMigration extends Migration {
  static version(): string {
    return '3.0.0';
  }

  protected registerStageHandlers(): void {
    this.registerStageHandler(
      ApplicationStage.FullSyncCompleted_13,
      async () => {
        await this.migrate();
        this.markDone();
      }
    );
  }

  private shouldMigrateTags(): boolean {
    const itemManager = this.services.itemManager;
    const hasActiveFoldersComponent = itemManager.components.some(
      (component) => component.active && component.area === ComponentArea.TagsList
    );

    return hasActiveFoldersComponent;
  }

  private async migrate(): Promise<void> {
    const showMigrateTags = this.shouldMigrateTags();

    if (!showMigrateTags) {
      return;
    }

    return TagsToFoldersMigration.upgradeTagFoldersToHierarchy(
      this.services.itemManager
    );
  }

  public static async upgradeTagFoldersToHierarchy(
    itemManager: ItemManager
  ): Promise<void> {
    const tags = itemManager.getItems(ContentType.Tag) as SNTag[];

    // Ensure we process path1 before path1.children
    const sortedTags = sortByKey(tags, 'title');

    for (const tag of sortedTags) {
      const hierarchy = tag.title.split('.');
      const hasSimpleTitle = hierarchy.length === 1;
      const hasParent = !!tag.parentId;
      const hasUnsupportedTitle = hierarchy.some(title => title.length === 0)

      if (hasParent || hasSimpleTitle || hasUnsupportedTitle) {
        continue;
      }

      const parents = withoutLastElement(hierarchy);
      const newTitle = lastElement(hierarchy);

      if (!newTitle) {
        return;
      }

      const parent = await itemManager.findOrCreateTagParentChain(parents);

      await itemManager.changeItem(tag.uuid, (mutator: TagMutator) => {
        mutator.title = newTitle;

        if (parent) {
          mutator.makeChildOf(parent);
        }
      });
    }
  }
}

import { PureService } from '@Lib/services/pure_service';
import { SFItem, SingletonStrategies } from '@Models';
import { arrayByRemovingFromIndex } from '@Lib/utils';
import { CopyPayload } from '@Payloads/generator';

export class SNSingletonManager extends PureService {

  constructor({ modelManager, syncManager }) {
    super();
    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.addCreationObserver();
  }

  addCreationObserver() {
    this.modelManager.addCreationObserver({
      callback: async ({ items, source, sourceKey }) => {
        await this.resolveSingletonsForItems(items);
      }
    });
  }

  validItemsMatchingPredicate(predicate) {
    return this.modelManager
      .itemsMatchingPredicate(predicate).filter((item) => {
        return !item.deleted && !item.errorDecrypting;
      });
  }

  async resolveSingletonsForItems(items) {
    for (const item of items) {
      if (!item.isSingleton) {
        continue;
      }

      const predicate = item.singletonPredicate;
      const items = this.validItemsMatchingPredicate(predicate);
      if (items.length <= 1) {
        continue;
      }

      await this.handleStrategy({
        items: items,
        strategy: item.singletonStrategy
      });
    }
  }

  async handleStrategy({ items, strategy }) {
    if (strategy !== SingletonStrategies.KeepEarliest) {
      throw 'Unhandled singleton strategy';
    }
    const earliestFirst = items.sort((a, b) => {
      /** -1: a comes first, 1: b comes first */
      if (a.errorDecrypting) { return 1; }
      if (b.errorDecrypting) { return -1; }
      return a.created_at < b.created_at ? -1 : 1;
    });
    const deleteItems = arrayByRemovingFromIndex(earliestFirst, 0);
    await this.modelManager.setItemsToBeDeleted(deleteItems);
    await this.syncManager.sync();
  }

  async findOrCreateSingleton({ predicate, createPayload }) {
    const items = this.validItemsMatchingPredicate(predicate);
    if (items.length > 0) {
      return items[0];
    }

    /** Item not found, safe to create after full sync has completed */
    if (!this.syncManager.getLastSyncDate()) {
      await this.syncManager.sync();
    }

    /** Check again */
    const refreshedItems = this.validItemsMatchingPredicate(predicate);
    if (refreshedItems.length > 0) {
      return refreshedItems[0];
    }

    /** Delete any items that are errored */
    const errorDecrypting = this.modelManager
      .itemsMatchingPredicate(predicate).filter((item) => {
        return item.errorDecrypting;
      });
    await this.modelManager.setItemsToBeDeleted(errorDecrypting);

    /** Safe to create */
    const dirtyPayload = CopyPayload({
      payload: createPayload,
      override: {
        uuid: await SFItem.GenerateUuid(),
        dirty: true
      }
    });
    const item = await this.modelManager.mapPayloadToLocalItem({
      payload: dirtyPayload
    });

    await this.syncManager.sync();

    return item;
  }
}

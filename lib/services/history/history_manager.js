import { PureService } from '@Lib/services/pure_service';
import { HistorySession } from '@Services/history/history_session';
import { PayloadSources } from '@Payloads/sources';
import { StorageKeys } from '@Lib/storage_keys';
import { isNullOrUndefined } from '@Lib/utils';

/**
 * The history manager is presently responsible for transient 'session history',
 * which include keeping track of changes made in the current application session.
 * These change logs (unless otherwise configured) are ephemeral and do not persist
 * past application restart.
 * In the future the history manager will also be responsible for remote server history.
 */
export class SNHistoryManager extends PureService {
  constructor({ modelManager, storageService, contentTypes, timeout }) {
    super();
    this.modelManager = modelManager;
    this.storageService = storageService;
    this.contentTypes = contentTypes;
    this.timeout = timeout;
  }

  async initializeFromDisk() {
    this.persistable = await this.storageService.getValue(
      StorageKeys.SessionHistoryPersistable
    );
    this.historySession = await this.storageService.getValue(
      StorageKeys.SessionHistoryRevisions
    ).then((historyValue) => {
      return new HistorySession(historyValue);
    });
    const autoOptimize = await this.storageService.getValue(
      StorageKeys.SessionHistoryOptimize
    );
    if (isNullOrUndefined(autoOptimize)) {
      /** Default to true */
      this.autoOptimize = true;
    } else {
      this.autoOptimize = autoOptimize;
    }
    this.addMappingObserver();
  }

  addMappingObserver() {
    this.modelManager.addMappingObserver(
      this.contentTypes,
      (allItems, validItems, deletedItems, source, sourceKey) => {
        if (source === PayloadSources.LocalDirtied) {
          return;
        }
        for (const item of allItems) {
          try {
            if (!item.deleted && !item.errorDecrypting) {
              this.addHistoryEntryForItem(item);
            }
          } catch (e) {
            console.error('Unable to add item history entry:', e);
          }
        }
      }
    );
  }

  isDiskEnabled() {
    return this.persistable;
  }

  isAutoOptimizeEnabled() {
    return this.autoOptimize;
  }

  async saveToDisk() {
    if (!this.persistable) {
      return;
    }
    this.storageService.setValue(
      StorageKeys.SessionHistoryRevisions,
      this.historySession
    );
  }

  setSessionItemRevisionThreshold(threshold) {
    this.historySession.setItemRevisionThreshold(threshold);
  }

  async addHistoryEntryForItem(item) {
    const persistableItemParams = {
      uuid: item.uuid,
      content_type: item.content_type,
      updated_at: item.updated_at,
      content: item.getContentCopy()
    };
    const entry = this.historySession.addEntryForItem(persistableItemParams);
    if (this.autoOptimize) {
      this.historySession.optimizeHistoryForItem(item);
    }

    const PERSIST_TIMEOUT = 2000;
    if (entry && this.persistable) {
      /** Debounce, clear existing timeout */
      if (this.diskTimeout) {
        if (this.timeout.hasOwnProperty('cancel')) {
          this.timeout.cancel(this.diskTimeout);
        } else {
          clearTimeout(this.diskTimeout);
        }
      };
      this.diskTimeout = this.timeout(() => {
        this.saveToDisk();
      }, PERSIST_TIMEOUT);
    }
  }

  historyForItem(item) {
    return this.historySession.historyForItem(item);
  }

  async clearHistoryForItem(item) {
    this.historySession.clearItemHistory(item);
    return this.saveToDisk();
  }

  async clearAllHistory() {
    this.historySession.clearAllHistory();
    return this.storageService.removeValue(
      StorageKeys.SessionHistoryRevisions
    );
  }

  async toggleDiskSaving() {
    this.persistable = !this.persistable;

    if (this.persistable) {
      this.storageService.setValue(
        StorageKeys.SessionHistoryPersistable,
        true
      );
      this.saveToDisk();
    } else {
      this.storageService.setValue(
        StorageKeys.SessionHistoryPersistable,
        false
      );
      return this.storageService.removeValue(
        StorageKeys.SessionHistoryRevisions
      );
    }
  }

  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;
    if (this.autoOptimize) {
      this.storageService.setValue(
        StorageKeys.SessionHistoryOptimize,
        true
      );
    } else {
      this.storageService.setValue(
        StorageKeys.SessionHistoryOptimize,
        false
      );
    }
  }
}

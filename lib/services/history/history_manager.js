import { PureService } from '@Lib/services/pure_service';
import { HistorySession } from '@Services/history/history_session';
import { PayloadSources } from '@Payloads/sources';
import { StorageKeys } from '@Lib/storage_keys';
import { isNullOrUndefined } from '@Lib/utils';

export class SNHistoryManager extends PureService {

  constructor({modelManager, storageManager, contentTypes, timeout}) {
    super();
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.contentTypes = contentTypes;
    this.timeout = timeout;
  }

  async initialize() {
    await this.loadFromDisk();
    this.addMappingObserver();
  }

  addMappingObserver() {
    this.modelManager.addMappingObserver(
      this.contentTypes,
      (allItems, validItems, deletedItems, source, sourceKey) => {
        if(source === PayloadSources.LocalDirted) {
          return;
        }
        for(const item of allItems) {
          try {
            this.addHistoryEntryForItem(item);
          } catch (e) {
            console.error('Unable to add item history entry:', e);
          }
        }
      }
    );
  }

  async loadFromDisk() {
    this.persistable = await this.storageManager.getValue(
      StorageKeys.SessionHistoryPersistable
    );
    this.historySession = await this.storageManager.getValue(
      StorageKeys.SessionHistoryRevisions
    ).then((historyValue) => {
      return new HistorySession(historyValue);
    });
    const autoOptimize = await this.storageManager.getValue(
      StorageKeys.SessionHistoryOptimize
    );
    if(isNullOrUndefined(autoOptimize)) {
      /** Default to true */
      this.autoOptimize = true;
    } else {
      this.autoOptimize = autoOptimize;
    }
  }

  isDiskEnabled() {
    return this.persistable;
  }

  isAutoOptimizeEnabled() {
    return this.autoOptimize;
  }


  async saveToDisk() {
    if(!this.persistable) {
      return;
    }
    this.storageManager.setValue(
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
    }
    const entry = this.historySession.addEntryForItem(persistableItemParams);
    if(this.autoOptimize) {
      this.historySession.optimizeHistoryForItem(item);
    }

    const PERSIST_TIMEOUT = 2000;
    if(entry && this.persistable) {
      /** Debounce, clear existing timeout */
      if(this.diskTimeout) {
        if(this.timeout.hasOwnProperty('cancel')) {
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
    return this.storageManager.removeValue(
      StorageKeys.SessionHistoryRevisions
    );
  }

  async toggleDiskSaving() {
    this.persistable = !this.persistable;

    if(this.persistable) {
      this.storageManager.setValue(
        StorageKeys.SessionHistoryPersistable,
        true
      );
      this.saveToDisk();
    } else {
      this.storageManager.setValue(
        StorageKeys.SessionHistoryPersistable,
        false
      );
      return this.storageManager.removeValue(
        StorageKeys.SessionHistoryRevisions
      );
    }
  }

  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;
    if(this.autoOptimize) {
      this.storageManager.setValue(
        StorageKeys.SessionHistoryOptimize,
        true
      );
    } else {
      this.storageManager.setValue(
        StorageKeys.SessionHistoryOptimize,
        false
      );
    }
  }
}

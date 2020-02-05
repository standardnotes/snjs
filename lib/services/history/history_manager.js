import { PureService } from '@Lib/services/pure_service';
import { SNModelManager } from '@Services/model_manager'
import { HistorySession } from '@Services/history/history_session';
import { ENCRYPTION_INTENT_SYNC } from '@Protocol/intents';
import { PAYLOAD_SOURCE_LOCAL_DIRTIED } from '@Payloads/sources';
import {
  STORAGE_KEY_SESSION_HISTORY_PERSISTABLE,
  STORAGE_KEY_SESSION_HISTORY_REVISIONS,
  STORAGE_KEY_SESSION_HISTORY_OPTIMIZE
} from '@Lib/storage_keys'

export class HistoryManager extends PureService {

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
        if(source === PAYLOAD_SOURCE_LOCAL_DIRTIED) {
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
      STORAGE_KEY_SESSION_HISTORY_PERSISTABLE
    );
    this.historySession = await this.storageManager.getValue(
      STORAGE_KEY_SESSION_HISTORY_REVISIONS
    ).then((historyValue) => {
      return new HistorySession(historyValue);
    })
    const autoOptimize = await this.storageManager.getValue(
      STORAGE_KEY_SESSION_HISTORY_OPTIMIZE
    );
    if(isNullOrUndefined(autoOptimize)) {
      /** Default to true */
      this.autoOptimize = true;
    } else {
      this.autoOptimize = autoOptimize;
    }
  }

  async saveToDisk() {
    if(!this.persistable) {
      return;
    }
    this.storageManager.setValue(
      STORAGE_KEY_SESSION_HISTORY_REVISIONS,
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
      }, PERSIST_TIMEOUT)
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
      STORAGE_KEY_SESSION_HISTORY_REVISIONS
    );
  }

  async toggleDiskSaving() {
    this.persistable = !this.persistable;

    if(this.persistable) {
      this.storageManager.setValue(
        STORAGE_KEY_SESSION_HISTORY_PERSISTABLE,
        true
      );
      this.saveToDisk();
    } else {
      this.storageManager.setValue(
        STORAGE_KEY_SESSION_HISTORY_PERSISTABLE,
        false
      );
      return this.storageManager.removeValue(
        STORAGE_KEY_SESSION_HISTORY_REVISIONS
      );
    }
  }

  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;
    if(this.autoOptimize) {
      this.storageManager.setValue(
        STORAGE_KEY_SESSION_HISTORY_OPTIMIZE,
        true
      );
    } else {
      this.storageManager.setValue(
        STORAGE_KEY_SESSION_HISTORY_OPTIMIZE,
        false
      );
    }
  }
}

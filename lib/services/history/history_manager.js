import { PureService } from '@Lib/services/pure_service';
import { SNModelManager } from '@Services/model_manager'
import { SFHistorySession } from '@Models/history/historySession';
import { ENCRYPTION_INTENT_SYNC } from '@Protocol/intents';
import { PAYLOAD_SOURCE_LOCAL_DIRTIED } from '@Payloads/sources';

import {
  SESSION_HISTORY_PERSIST_KEY,
  SESSION_HISTORY_REVISIONS_KEY,
  SESSION_HISTORY_OPTIMIZE_KEY
} from '@Lib/storage_keys'

export class SFSessionHistoryManager extends PureService {

  constructor(modelManager, storageManager, contentTypes, timeout) {
    super();
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.timeout = timeout || setTimeout.bind(window);

    this.loadFromDisk().then(() => {
      this.modelManager.addMappingObserver("session-history", contentTypes, (allItems, validItems, deletedItems, source, sourceKey) => {
        if(source === PAYLOAD_SOURCE_LOCAL_DIRTIED) {
          return;
        }
        for(let item of allItems) {
          try {
            this.addHistoryEntryForItem(item);
          } catch (e) {
            console.error("Caught exception while trying to add item history entry", e);
          }
        }
      });
    })
  }

  addHistoryEntryForItem(item) {
    let persistableItemParams = {
      uuid: item.uuid,
      content_type: item.content_type,
      updated_at: item.updated_at,
      content: item.getContentCopy()
    }

    let entry = this.historySession.addEntryForItem(persistableItemParams);

    if(this.autoOptimize) {
      this.historySession.optimizeHistoryForItem(item);
    }

    if(entry && this.diskEnabled) {
      // Debounce, clear existing timeout
      if(this.diskTimeout) {
        if(this.timeout.hasOwnProperty("cancel")) {
          this.timeout.cancel(this.diskTimeout);
        } else {
          clearTimeout(this.diskTimeout);
        }
      };
      this.diskTimeout = this.timeout(() => {
        this.saveToDisk();
      }, 2000)
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
    return this.storageManager.removeValue(SESSION_HISTORY_REVISIONS_KEY);
  }

  async toggleDiskSaving() {
    this.diskEnabled = !this.diskEnabled;

    if(this.diskEnabled) {
      this.storageManager.setValue(SESSION_HISTORY_PERSIST_KEY, JSON.stringify(true));
      this.saveToDisk();
    } else {
      this.storageManager.setValue(SESSION_HISTORY_PERSIST_KEY, JSON.stringify(false));
      return this.storageManager.removeValue(SESSION_HISTORY_REVISIONS_KEY);
    }
  }

  async saveToDisk() {
    if(!this.diskEnabled) {
      return;
    }

    this.storageManager.setValue(SESSION_HISTORY_REVISIONS_KEY, JSON.stringify(this.historySession));
  }

  async loadFromDisk() {
    var diskValue = await this.storageManager.getValue(SESSION_HISTORY_PERSIST_KEY);
    if(diskValue) {
      this.diskEnabled = JSON.parse(diskValue);
    }

    let historyValue = await this.storageManager.getValue(SESSION_HISTORY_REVISIONS_KEY);
    if(historyValue) {
      historyValue = JSON.parse(historyValue);;
      this.historySession = new SFHistorySession(historyValue);
    } else {
      this.historySession = new SFHistorySession();
    }

    var autoOptimizeValue = await this.storageManager.getValue(SESSION_HISTORY_OPTIMIZE_KEY);
    if(autoOptimizeValue) {
      this.autoOptimize = JSON.parse(autoOptimizeValue);
    } else {
      // default value is true
      this.autoOptimize = true;
    }
  }

  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;

    if(this.autoOptimize) {
      this.storageManager.setValue(SESSION_HISTORY_OPTIMIZE_KEY, JSON.stringify(true));
    } else {
      this.storageManager.setValue(SESSION_HISTORY_OPTIMIZE_KEY, JSON.stringify(false));
    }
  }
}

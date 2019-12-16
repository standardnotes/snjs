import { SNJS } from '@Lib/standard_notes';
import { SFModelManager } from '@Services/modelManager'
import { SFItemParams } from '@Models/core/itemParams'
import { SFHistorySession } from '@Models/session_history/historySession';

const SessionHistoryPersistKey = "sessionHistory_persist";
const SessionHistoryRevisionsKey = "sessionHistory_revisions";
const SessionHistoryAutoOptimizeKey = "sessionHistory_autoOptimize";

export class SFSessionHistoryManager {

  constructor(modelManager, storageManager, keyRequestHandler, contentTypes, timeout) {
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.$timeout = timeout || setTimeout.bind(window);

    // Required to persist the encrypted form of SFHistorySession
    this.keyRequestHandler = keyRequestHandler;

    this.loadFromDisk().then(() => {
      this.modelManager.addItemSyncObserver("session-history", contentTypes, (allItems, validItems, deletedItems, source, sourceKey) => {
        if(source === SFModelManager.MappingSourceLocalDirtied) {
          return;
        }
        for(let item of allItems) {
          try {
            this.addHistoryEntryForItem(item);
          } catch (e) {
            console.log("Caught exception while trying to add item history entry", e);
          }
        }
      });
    })
  }

  async encryptionParams() {
    // Should return a dictionary: {offline, keys, auth_params}
    return this.keyRequestHandler();
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
        if(this.$timeout.hasOwnProperty("cancel")) {
          this.$timeout.cancel(this.diskTimeout);
        } else {
          clearTimeout(this.diskTimeout);
        }
      };
      this.diskTimeout = this.$timeout(() => {
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
    return this.storageManager.removeItem(SessionHistoryRevisionsKey);
  }

  async toggleDiskSaving() {
    this.diskEnabled = !this.diskEnabled;

    if(this.diskEnabled) {
      this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(true));
      this.saveToDisk();
    } else {
      this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(false));
      return this.storageManager.removeItem(SessionHistoryRevisionsKey);
    }
  }

  async saveToDisk() {
    if(!this.diskEnabled) {
      return;
    }

    let encryptionParams = await this.encryptionParams();

    var itemParams = new SFItemParams(this.historySession, encryptionParams.keys, encryptionParams.auth_params);
    itemParams.paramsForSync().then((syncParams) => {
      // console.log("Saving to disk", syncParams);
      this.storageManager.setItem(SessionHistoryRevisionsKey, JSON.stringify(syncParams));
    })
  }

  async loadFromDisk() {
    var diskValue = await this.storageManager.getItem(SessionHistoryPersistKey);
    if(diskValue) {
      this.diskEnabled = JSON.parse(diskValue);
    }

    var historyValue = await this.storageManager.getItem(SessionHistoryRevisionsKey);
    if(historyValue) {
      historyValue = JSON.parse(historyValue);
      let encryptionParams = await this.encryptionParams();
      await SNJS.itemTransformer.decryptItem(historyValue, encryptionParams.keys);
      var historySession = new SFHistorySession(historyValue);
      this.historySession = historySession;
    } else {
      this.historySession = new SFHistorySession();
    }

    var autoOptimizeValue = await this.storageManager.getItem(SessionHistoryAutoOptimizeKey);
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
      this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(true));
    } else {
      this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(false));
    }
  }
}

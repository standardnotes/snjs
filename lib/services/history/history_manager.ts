import { CreateSourcedPayloadFromObject } from '@Payloads/generator';
import { SNItem } from '@Models/core/item';
import { SNStorageService } from '@Services/index';
import { ContentTypes } from '@Models/content_types';
import { SNModelManager } from './../model_manager';
import { PureService } from '@Lib/services/pure_service';
import { HistorySession } from '@Services/history/history_session';
import { PayloadSources } from '@Payloads/sources';
import { StorageKeys } from '@Lib/storage_keys';
import { isNullOrUndefined } from '@Lib/utils';

const PERSIST_TIMEOUT = 2000;

/**
 * The history manager is presently responsible for transient 'session history',
 * which include keeping track of changes made in the current application session.
 * These change logs (unless otherwise configured) are ephemeral and do not persist
 * past application restart.
 * In the future the history manager will also be responsible for remote server history.
 */
export class SNHistoryManager extends PureService {

  private modelManager?: SNModelManager
  private storageService?: SNStorageService
  private contentTypes: ContentTypes[] = []
  private timeout: any
  private historySession?: HistorySession
  private removeMappingObserver: any
  private persistable = false
  private autoOptimize = false
  private saveTimeout: any

  constructor(
    modelManager: SNModelManager,
    storageService: SNStorageService,
    contentTypes: ContentTypes[],
    timeout: any
  ) {
    super();
    this.modelManager = modelManager;
    this.storageService = storageService;
    this.contentTypes = contentTypes;
    this.timeout = timeout;
  }

  public deinit() {
    this.modelManager = undefined;
    this.storageService = undefined;
    this.contentTypes.length = 0;
    this.historySession = undefined;
    this.timeout = null;
    if (this.removeMappingObserver) {
      this.removeMappingObserver();
      this.removeMappingObserver = null;
    }
    super.deinit();
  }

  async initializeFromDisk() {
    this.persistable = await this.storageService!.getValue(
      StorageKeys.SessionHistoryPersistable
    );
    this.historySession = await this.storageService!.getValue(
      StorageKeys.SessionHistoryRevisions
    ).then((historyValue) => {
      return HistorySession.FromJson(historyValue);
    });
    const autoOptimize = await this.storageService!.getValue(
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
    this.removeMappingObserver = this.modelManager!.addMappingObserver(
      this.contentTypes,
      async (allItems, _, __, source, ___) => {
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
    this.storageService!.setValue(
      StorageKeys.SessionHistoryRevisions,
      this.historySession
    );
  }

  setSessionItemRevisionThreshold(threshold: number) {
    this.historySession!.setItemRevisionThreshold(threshold);
  }

  async addHistoryEntryForItem(item: SNItem) {
    const payload = CreateSourcedPayloadFromObject(item, PayloadSources.SessionHistory)
    const entry = this.historySession!.addEntryForPayload(payload);
    if (this.autoOptimize) {
      this.historySession!.optimizeHistoryForItem(item.uuid);
    }
    if (entry && this.persistable) {
      /** Debounce, clear existing timeout */
      if (this.saveTimeout) {
        if (this.timeout.hasOwnProperty('cancel')) {
          this.timeout.cancel(this.saveTimeout);
        } else {
          clearTimeout(this.saveTimeout);
        }
      };
      this.saveTimeout = this.timeout(() => {
        this.saveToDisk();
      }, PERSIST_TIMEOUT);
    }
  }

  historyForItem(item: SNItem) {
    return this.historySession!.historyForItem(item.uuid);
  }

  async clearHistoryForItem(item: SNItem) {
    this.historySession!.clearItemHistory(item);
    return this.saveToDisk();
  }

  async clearAllHistory() {
    this.historySession!.clearAllHistory();
    return this.storageService!.removeValue(
      StorageKeys.SessionHistoryRevisions
    );
  }

  async toggleDiskSaving() {
    this.persistable = !this.persistable;
    if (this.persistable) {
      this.storageService!.setValue(
        StorageKeys.SessionHistoryPersistable,
        true
      );
      this.saveToDisk();
    } else {
      this.storageService!.setValue(
        StorageKeys.SessionHistoryPersistable,
        false
      );
      return this.storageService!.removeValue(
        StorageKeys.SessionHistoryRevisions
      );
    }
  }

  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;
    if (this.autoOptimize) {
      this.storageService!.setValue(
        StorageKeys.SessionHistoryOptimize,
        true
      );
    } else {
      this.storageService!.setValue(
        StorageKeys.SessionHistoryOptimize,
        false
      );
    }
  }
}

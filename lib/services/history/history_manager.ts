import { SessionHistoryMap } from '@Services/history/session/session_history_map';
import { RawPayload } from './../../protocol/payloads/generator';
import { ItemHistorySource, ItemHistoryEntry } from '@Services/history/entries/item_history_entry';
import { SNStorageService } from '@Services/storage_service';
import { ItemManager } from '@Services/item_manager';
import { CreateSourcedPayloadFromObject } from '@Payloads/generator';
import { SNItem } from '@Models/core/item';
import { ContentType } from '@Models/content_types';
import { PureService } from '@Lib/services/pure_service';
import { PayloadSource } from '@Payloads/sources';
import { StorageKey } from '@Lib/storage_keys';
import { isNullOrUndefined, concatArrays, Copy } from '@Lib/utils';
import { SNApiService } from '@Lib/services/api/api_service';
import { SNProtocolService } from '@Lib/services/protocol_service';

type RawRevisionPayload = RawPayload & {
  item_id: string
}

type RemoteHistoryListEntry = {
  /** The uuid of the revision, not the item */
  uuid: string
  content_type: ContentType
  created_at: Date
  updated_at: Date
}

export type RemoteHistoryList = RemoteHistoryListEntry[];

const PERSIST_TIMEOUT = 2000;

/**
 * The history manager is responsible for:
 * 1. Transient session history, which include keeping track of changes made in the
 *    current application session. These change logs (unless otherwise configured) are
 *    ephemeral and do not persist past application restart. Session history entries are
 *    added via change observers that trigger when an item changes.
 * 2. Remote server history. Entries are automatically added by the server and must be
 *    retrieved per item via an API call.
 */
export class SNHistoryManager extends PureService {

  private itemManager?: ItemManager
  private storageService?: SNStorageService
  private apiService: SNApiService
  private protocolService: SNProtocolService
  private contentTypes: ContentType[] = []
  private timeout: any
  private sessionHistory?: SessionHistoryMap
  private removeChangeObserver: any
  private persistable = false
  public autoOptimize = false
  private saveTimeout: any

  constructor(
    itemManager: ItemManager,
    storageService: SNStorageService,
    apiService: SNApiService,
    protocolService: SNProtocolService,
    contentTypes: ContentType[],
    timeout: any
  ) {
    super();
    this.itemManager = itemManager;
    this.storageService = storageService;
    this.contentTypes = contentTypes;
    this.timeout = timeout;
    this.apiService = apiService;
    this.protocolService = protocolService;
  }

  public deinit() {
    this.itemManager = undefined;
    this.storageService = undefined;
    this.contentTypes.length = 0;
    this.sessionHistory = undefined;
    this.timeout = null;
    if (this.removeChangeObserver) {
      this.removeChangeObserver();
      this.removeChangeObserver = null;
    }
    super.deinit();
  }

  /** For local session history */
  async initializeFromDisk() {
    this.persistable = await this.storageService!.getValue(
      StorageKey.SessionHistoryPersistable
    );
    this.sessionHistory = await this.storageService!.getValue(
      StorageKey.SessionHistoryRevisions
    ).then((historyValue) => {
      return SessionHistoryMap.FromJson(historyValue);
    });
    const autoOptimize = await this.storageService!.getValue(
      StorageKey.SessionHistoryOptimize
    );
    if (isNullOrUndefined(autoOptimize)) {
      /** Default to true */
      this.autoOptimize = true;
    } else {
      this.autoOptimize = autoOptimize;
    }
    this.addChangeObserver();
  }

  addChangeObserver() {
    this.removeChangeObserver = this.itemManager!.addObserver(
      this.contentTypes,
      (changed, inserted, discarded, source) => {
        const items = concatArrays(changed, inserted, discarded) as SNItem[];
        if (source === PayloadSource.LocalChanged) {
          return;
        }
        for (const item of items) {
          try {
            if (!item.deleted && !item.errorDecrypting) {
              this.addHistoryEntryForItem(item);
            }
          } catch (e) {
            console.error('Unable to add item history entry:', e);
          }
        }
      }
    )
  }

  /** For local session history */
  isDiskEnabled() {
    return this.persistable;
  }

  /** For local session history */
  isAutoOptimizeEnabled() {
    return this.autoOptimize;
  }

  /** For local session history */
  async saveToDisk() {
    if (!this.persistable) {
      return;
    }
    this.storageService!.setValue(
      StorageKey.SessionHistoryRevisions,
      this.sessionHistory
    );
  }

  /** For local session history */
  setSessionItemRevisionThreshold(threshold: number) {
    this.sessionHistory!.setItemRevisionThreshold(threshold);
  }

  async addHistoryEntryForItem(item: SNItem) {
    const payload = CreateSourcedPayloadFromObject(item, PayloadSource.SessionHistory)
    const entry = this.sessionHistory!.addEntryForPayload(payload);
    if (this.autoOptimize) {
      this.sessionHistory!.optimizeHistoryForItem(item.uuid);
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

  sessionHistoryForItem(item: SNItem) {
    return this.sessionHistory!.historyForItem(item.uuid);
  }

  /** For local session history */
  async clearHistoryForItem(item: SNItem) {
    this.sessionHistory!.clearItemHistory(item);
    return this.saveToDisk();
  }

  /** For local session history */
  async clearAllHistory() {
    this.sessionHistory!.clearAllHistory();
    return this.storageService!.removeValue(
      StorageKey.SessionHistoryRevisions
    );
  }

  /** For local session history */
  async toggleDiskSaving() {
    this.persistable = !this.persistable;
    if (this.persistable) {
      this.storageService!.setValue(
        StorageKey.SessionHistoryPersistable,
        true
      );
      this.saveToDisk();
    } else {
      this.storageService!.setValue(
        StorageKey.SessionHistoryPersistable,
        false
      );
      return this.storageService!.removeValue(
        StorageKey.SessionHistoryRevisions
      );
    }
  }

  /** For local session history */
  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;
    if (this.autoOptimize) {
      this.storageService!.setValue(
        StorageKey.SessionHistoryOptimize,
        true
      );
    } else {
      this.storageService!.setValue(
        StorageKey.SessionHistoryOptimize,
        false
      );
    }
  }

  /**
   * Fetches a list of revisions from the server for an item. These revisions do not
   * include the item's content. Instead, each revision's content must be fetched
   * individually upon selection via `fetchRemoteRevision`.
   */
  async remoteHistoryForItem(item: SNItem) {
    const serverResponse = await this.apiService!.getItemRevisions(item.uuid);
    if (serverResponse.error) {
      return undefined;
    }
    return serverResponse.object as RemoteHistoryList;
  }

  /**
   * Expands on a revision fetched via `remoteHistoryForItem` by getting a revision's
   * complete fields (including encrypted content).
   */
  async fetchRemoteRevision(itemUuid: string, revisionListEntry: RemoteHistoryListEntry) {
    const serverResponse = await this.apiService!.getRevisionForItem(itemUuid, revisionListEntry.uuid);
    if (serverResponse.error) {
      return undefined;
    }
    const payload = Copy(serverResponse.object) as RawRevisionPayload;
    const encryptedPayload = CreateSourcedPayloadFromObject(payload, PayloadSource.RemoteHistory, {
      uuid: itemUuid,
    });
    const decryptedPayload = await this.protocolService!.payloadByDecryptingPayload(encryptedPayload);
    return new ItemHistoryEntry(decryptedPayload, ItemHistorySource.Remote);
  }
}

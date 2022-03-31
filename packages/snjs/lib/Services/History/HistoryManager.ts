import { ContentType } from '@standardnotes/common'
import { EncryptionService } from '@standardnotes/encryption'
import { isNullOrUndefined, removeFromArray } from '@standardnotes/utils'
import { ItemManager } from '@Lib/Services/Items/ItemManager'
import { SNApiService } from '@Lib/Services/Api/ApiService'
import { SNStorageService } from '@Lib/Services/Storage/StorageService'
import { StorageKey } from '@standardnotes/services'
import { UuidString } from '../../Types/UuidString'
import * as Models from '@standardnotes/models'
import * as Payloads from '@standardnotes/payloads'
import * as Responses from '@standardnotes/responses'
import * as Services from '@standardnotes/services'

const PersistTimeout = 2000

type PersistableHistoryEntry = {
  payload: Payloads.RawPayload
}

type PersistableHistory = Record<UuidString, PersistableHistoryEntry[]>

/** The amount of revisions per item above which should call for an optimization. */
const DefaultItemRevisionsThreshold = 20

/**
 * The amount of characters added or removed that
 * constitute a keepable entry after optimization.
 */
const LargeEntryDeltaThreshold = 25

/**
 * The history manager is responsible for:
 * 1. Transient session history, which include keeping track of changes made in the
 *    current application session. These change logs (unless otherwise configured) are
 *    ephemeral and do not persist past application restart. Session history entries are
 *    added via change observers that trigger when an item changes.
 * 2. Remote server history. Entries are automatically added by the server and must be
 *    retrieved per item via an API call.
 */
export class SNHistoryManager extends Services.AbstractService {
  private persistable = false
  public autoOptimize = false
  private removeChangeObserver: () => void
  private saveTimeout!: number

  /**
   * When no history exists for an item yet, we first put it in the staging map.
   * Then, the next time the item changes and it has no history, we check the staging map.
   * If the entry from the staging map differs from the incoming change, we now add the incoming
   * change to the history map and remove it from staging. This is a way to detect when the first
   * actual change of an item occurs (especially new items), rather than tracking a change
   * as an item propagating through the different PayloadSource
   * lifecycles (created, local saved, presyncsave, etc)
   */
  private historyStaging: Partial<Record<UuidString, Models.HistoryEntry>> = {}
  private history: Models.HistoryMap = {}
  /** The content types for which to record history */
  public readonly historyTypes: ContentType[] = [ContentType.Note]

  private itemRevisionThreshold = DefaultItemRevisionsThreshold

  constructor(
    private itemManager: ItemManager,
    private storageService: SNStorageService,
    private apiService: SNApiService,
    private protocolService: EncryptionService,
    public deviceInterface: Services.DeviceInterface,
    protected internalEventBus: Services.InternalEventBusInterface,
  ) {
    super(internalEventBus)
    this.removeChangeObserver = this.itemManager.addObserver(
      this.historyTypes,
      (changed, inserted) => {
        this.recordNewHistoryForItems(changed.concat(inserted))
      },
    )
  }

  public deinit(): void {
    this.cancelPendingPersist()
    ;(this.itemManager as unknown) = undefined
    ;(this.storageService as unknown) = undefined
    ;(this.history as unknown) = undefined
    if (this.removeChangeObserver) {
      this.removeChangeObserver()
      ;(this.removeChangeObserver as unknown) = undefined
    }
    super.deinit()
  }

  /** For local session history */
  async initializeFromDisk(): Promise<void> {
    this.persistable = await this.storageService.getValue(StorageKey.SessionHistoryPersistable)
    this.history = await this.getPersistedHistory()
    this.autoOptimize = this.storageService.getValue(
      StorageKey.SessionHistoryOptimize,
      undefined,
      true,
    )
  }

  private async getPersistedHistory(): Promise<Record<UuidString, Models.HistoryEntry[]>> {
    const historyMap: Record<UuidString, Models.HistoryEntry[]> = {}
    const rawHistory: PersistableHistory = await this.storageService.getValue(
      StorageKey.SessionHistoryRevisions,
    )
    if (!rawHistory) {
      return historyMap
    }
    for (const [uuid, historyDescending] of Object.entries(rawHistory)) {
      const historyAscending = historyDescending.slice().reverse()
      const entries: Models.HistoryEntry[] = []
      for (const rawEntry of historyAscending) {
        const payload = Payloads.CreateSourcedPayloadFromObject(
          rawEntry.payload,
          Payloads.PayloadSource.SessionHistory,
        ) as Payloads.SurePayload
        const previousEntry = Models.historyMapFunctions.getNewestRevision(entries)
        const entry = Models.CreateHistoryEntryForPayload(payload, previousEntry)
        entries.unshift(entry)
      }
      historyMap[uuid] = entries
    }
    return historyMap
  }

  private recordNewHistoryForItems(items: Models.SNItem[]) {
    let needsPersist = false
    for (const item of items) {
      if (!this.historyTypes.includes(item.content_type)) {
        continue
      }
      const payload = item.payload
      if (item.deleted || payload.format !== Payloads.PayloadFormat.DecryptedBareObject) {
        continue
      }
      const itemHistory = this.history[item.uuid] || []
      const latestEntry = Models.historyMapFunctions.getNewestRevision(itemHistory)
      const historyPayload = Payloads.CreateSourcedPayloadFromObject(
        item,
        Payloads.PayloadSource.SessionHistory,
      ) as Payloads.SurePayload
      const currentValueEntry = Models.CreateHistoryEntryForPayload(historyPayload, latestEntry)
      if (currentValueEntry.isDiscardable()) {
        continue
      }
      /**
       * For every change that comes in, first add it to the staging area.
       * Then, only on the next subsequent change do we add this previously
       * staged entry
       */
      const stagedEntry = this.historyStaging[item.uuid]
      /** Add prospective to staging, and consider now adding previously staged as new revision */
      this.historyStaging[item.uuid] = currentValueEntry
      if (!stagedEntry) {
        continue
      }
      if (stagedEntry.isSameAsEntry(currentValueEntry)) {
        continue
      }
      if (latestEntry && stagedEntry.isSameAsEntry(latestEntry)) {
        continue
      }
      itemHistory.unshift(stagedEntry)
      this.history[item.uuid] = itemHistory
      if (this.autoOptimize) {
        this.optimizeHistoryForItem(item.uuid)
      }
      needsPersist = true
    }
    if (needsPersist) {
      this.saveToDisk()
    }
  }

  /** For local session history */
  isDiskEnabled(): boolean {
    return this.persistable
  }

  /** For local session history */
  isAutoOptimizeEnabled(): boolean {
    return this.autoOptimize
  }

  cancelPendingPersist(): void {
    if (this.saveTimeout) {
      this.deviceInterface.cancelTimeout(this.saveTimeout)
    }
  }

  /** For local session history */
  saveToDisk(): void {
    if (!this.persistable) {
      return
    }
    this.cancelPendingPersist()
    const persistableValue = this.persistableHistoryValue()
    this.saveTimeout = this.deviceInterface.timeout(() => {
      this.storageService.setValue(StorageKey.SessionHistoryRevisions, persistableValue)
    }, PersistTimeout)
  }

  private persistableHistoryValue(): PersistableHistory {
    const persistedObject: PersistableHistory = {}
    for (const [uuid, historyArray] of Object.entries(this.history)) {
      const entries = historyArray.map((entry) => {
        return { payload: entry.payload } as PersistableHistoryEntry
      })
      persistedObject[uuid] = entries
    }
    return persistedObject
  }

  /** For local session history */
  setSessionItemRevisionThreshold(threshold: number): void {
    this.itemRevisionThreshold = threshold
  }

  sessionHistoryForItem(item: Models.SNItem): Models.HistoryEntry[] {
    return this.history[item.uuid] || []
  }

  /** For local session history */
  clearHistoryForItem(item: Models.SNItem): void {
    delete this.history[item.uuid]
    this.saveToDisk()
  }

  /** For local session history */
  clearAllHistory(): Promise<void> {
    this.history = {}
    return this.storageService.removeValue(StorageKey.SessionHistoryRevisions)
  }

  /** For local session history */
  toggleDiskSaving(): void {
    this.persistable = !this.persistable

    if (this.persistable) {
      this.storageService.setValue(StorageKey.SessionHistoryPersistable, true)
      this.saveToDisk()
    } else {
      this.storageService.setValue(StorageKey.SessionHistoryPersistable, false)
      this.storageService.removeValue(StorageKey.SessionHistoryRevisions)
    }
  }

  /** For local session history */
  toggleAutoOptimize(): void {
    this.autoOptimize = !this.autoOptimize
    if (this.autoOptimize) {
      this.storageService.setValue(StorageKey.SessionHistoryOptimize, true)
    } else {
      this.storageService.setValue(StorageKey.SessionHistoryOptimize, false)
    }
  }

  getHistoryMapCopy(): Models.HistoryMap {
    const copy = Object.assign({}, this.history)
    for (const [key, value] of Object.entries(copy)) {
      copy[key] = value.slice()
    }
    return Object.freeze(copy)
  }

  /**
   * Fetches a list of revisions from the server for an item. These revisions do not
   * include the item's content. Instead, each revision's content must be fetched
   * individually upon selection via `fetchRemoteRevision`.
   */
  async remoteHistoryForItem(
    item: Models.SNItem,
  ): Promise<Responses.RevisionListEntry[] | undefined> {
    const response = await this.apiService.getItemRevisions(item.uuid)
    if (response.error || isNullOrUndefined(response.data)) {
      return undefined
    }
    return (response as Responses.RevisionListResponse).data
  }

  /**
   * Expands on a revision fetched via `remoteHistoryForItem` by getting a revision's
   * complete fields (including encrypted content).
   */
  async fetchRemoteRevision(
    itemUuid: UuidString,
    entry: Responses.RevisionListEntry,
  ): Promise<Models.HistoryEntry | undefined> {
    const revisionResponse = await this.apiService.getRevision(entry, itemUuid)
    if (revisionResponse.error || isNullOrUndefined(revisionResponse.data)) {
      return undefined
    }
    const revision = (revisionResponse as Responses.SingleRevisionResponse).data

    const serverPayload = Payloads.CreateMaxPayloadFromAnyObject(
      revision as unknown as Payloads.RawPayload,
    )
    /**
     * When an item is duplicated, its revisions also carry over to the newly created item.
     * However since the new item has a different UUID than the source item, we must decrypt
     * these olders revisions (which have not been mutated after copy) with the source item's
     * uuid.
     */
    const embeddedParams = await this.protocolService.getEmbeddedPayloadAuthenticatedData(
      serverPayload,
    )
    const sourceItemUuid = embeddedParams?.u
    const payload = Payloads.CopyPayload(
      Payloads.CreateMaxPayloadFromAnyObject(revision as unknown as Payloads.RawPayload),
      {
        uuid: sourceItemUuid || revision.item_uuid,
      },
    )

    if (!Payloads.isRemotePayloadAllowed(payload)) {
      console.error('Remote payload is disallowed', payload)
      return undefined
    }

    const encryptedPayload = Payloads.CreateSourcedPayloadFromObject(
      payload,
      Payloads.PayloadSource.RemoteHistory,
    )
    const decryptedPayload = await this.protocolService.decryptSplitSingle({
      usesItemsKeyWithKeyLookup: { items: [encryptedPayload] },
    })
    if (decryptedPayload.errorDecrypting) {
      return undefined
    }
    return new Models.HistoryEntry(decryptedPayload as Payloads.SurePayload)
  }

  async deleteRemoteRevision(
    itemUuid: UuidString,
    entry: Responses.RevisionListEntry,
  ): Promise<Responses.MinimalHttpResponse> {
    const response = await this.apiService.deleteRevision(itemUuid, entry)
    return response
  }

  /**
   * Clean up if there are too many revisions. Note itemRevisionThreshold
   * is the amount of revisions which above, call for an optimization. An
   * optimization may not remove entries above this threshold. It will
   * determine what it should keep and what it shouldn't. So, it is possible
   * to have a threshold of 60 but have 600 entries, if the item history deems
   * those worth keeping.
   *
   * Rules:
   * - Keep an entry if it is the oldest entry
   * - Keep an entry if it is the latest entry
   * - Keep an entry if it is Significant
   * - If an entry is Significant and it is a deletion change, keep the entry before this entry.
   */
  optimizeHistoryForItem(uuid: string): void {
    const entries = this.history[uuid] || []
    if (entries.length <= this.itemRevisionThreshold) {
      return
    }

    const isEntrySignificant = (entry: Models.HistoryEntry) => {
      return entry.deltaSize() > LargeEntryDeltaThreshold
    }
    const keepEntries: Models.HistoryEntry[] = []
    const processEntry = (entry: Models.HistoryEntry, index: number, keep: boolean) => {
      /**
       * Entries may be processed retrospectively, meaning it can be
       * decided to be deleted, then an upcoming processing can change that.
       */
      if (keep) {
        keepEntries.unshift(entry)
        if (isEntrySignificant(entry) && entry.operationVector() === -1) {
          /** This is a large negative change. Hang on to the previous entry. */
          const previousEntry = entries[index + 1]
          if (previousEntry) {
            keepEntries.unshift(previousEntry)
          }
        }
      } else {
        /** Don't keep, remove if in keep */
        removeFromArray(keepEntries, entry)
      }
    }
    for (let index = entries.length - 1; index >= 0; index--) {
      const entry = entries[index]
      const isSignificant = index === 0 || index === entries.length - 1 || isEntrySignificant(entry)
      processEntry(entry, index, isSignificant)
    }
    const filtered = entries.filter((entry) => {
      return keepEntries.includes(entry)
    })
    this.history[uuid] = filtered
  }
}
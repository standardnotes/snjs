import { SNItemsKey } from '@Lib/models/ItemsKey/ItemsKey'
import { SNHistoryManager } from '../History/HistoryManager'
import { StorageKey } from '@Lib/storage_keys'
import { UuidString } from '../../types'
import { ApplicationSyncOptions } from '../../options'
import { ItemManager } from '@Lib/services/Items/ItemManager'
import { SyncResponse } from '@Lib/services/Sync/Response'
import { SNItem } from '@Lib/models/Item/Item'
import { MutationType } from "@Lib/models/Item/MutationType"
import {
  PurePayload,
  PayloadField,
  PayloadSource,
  ImmutablePayloadCollection,
  CreateMaxPayloadFromAnyObject,
  RawPayload,
  PayloadInterface,
  CreateSourcedPayloadFromObject,
  filterDisallowedRemotePayloads,
} from '@standardnotes/payloads'
import { PayloadManager } from '../PayloadManager'
import { SNStorageService } from '../StorageService'
import { SNProtocolService } from '../ProtocolService'
import { isNullOrUndefined, removeFromIndex, sleep, subtractFromArray } from '@standardnotes/utils'
import { SortPayloadsByRecentAndContentPriority } from '@Lib/services/Sync/Utils'
import { SyncOpStatus } from '@Lib/services/Sync/SyncOpStatus'
import { SyncResponseResolver } from '@Lib/services/Sync/Account/ResponseResolver'
import { AccountSyncOperation } from '@Lib/services/Sync/Account/Operation'
import { OfflineSyncOperation } from '@Lib/services/Sync/Offline/Operation'
import { DeltaOutOfSync } from '@Payloads/deltas'
import { ContentType } from '@standardnotes/common'
import { EncryptionIntent } from '@standardnotes/applications'
import { CreateItemFromPayload } from '@Lib/models/Generator'
import { Uuids } from '@Lib/models/Functions'
import { SyncSignal, SyncStats } from '@Lib/services/Sync/Signals'
import { SNSessionManager } from '../Api/SessionManager'
import { SNApiService } from '../Api/ApiService'
import { SNLog } from '@Lib/log'
import { SyncMode, SyncOptions, SyncPromise, SyncQueueStrategy } from './Types'
import {
  AbstractService,
  IntegrityEvent,
  InternalEventBusInterface,
  InternalEventHandlerInterface,
  InternalEventInterface,
  SyncEvent,
  IntegrityEventPayload,
  SyncSource,
} from '@standardnotes/services'
import { SyncClientInterface } from './SyncClientInterface'

const DEFAULT_MAJOR_CHANGE_THRESHOLD = 15
const INVALID_SESSION_RESPONSE_STATUS = 401

/**
 * The sync service orchestrates with the model manager, api service, and storage service
 * to ensure consistent state between the three. When a change is made to an item, consumers
 * call the sync service's sync function to first persist pending changes to local storage.
 * Then, the items are uploaded to the server. The sync service handles server responses,
 * including mapping any retrieved items to application state via model manager mapping.
 * After each sync request, any changes made or retrieved are also persisted locally.
 * The sync service largely does not perform any task unless it is called upon.
 */
export class SNSyncService
  extends AbstractService<SyncEvent, SyncResponse | { source: SyncSource }>
  implements InternalEventHandlerInterface, SyncClientInterface
{
  private lastPreSyncSave?: Date
  private lastSyncDate?: Date
  private outOfSync = false
  private opStatus: SyncOpStatus

  private resolveQueue: SyncPromise[] = []
  private spawnQueue: SyncPromise[] = []

  /* A DownloadFirst sync must always be the first sync completed */
  public completedOnlineDownloadFirstSync = false

  private majorChangeThreshold = DEFAULT_MAJOR_CHANGE_THRESHOLD
  private clientLocked = false
  private databaseLoaded = false

  private syncToken?: string
  private cursorToken?: string

  private syncLock = false
  private _simulate_latency?: { latency: number; enabled: boolean }
  private dealloced = false

  public lastSyncInvokationPromise?: Promise<unknown>
  public currentSyncRequestPromise?: Promise<void>

  /** Content types appearing first are always mapped first */
  private readonly localLoadPriorty = [
    ContentType.ItemsKey,
    ContentType.UserPrefs,
    ContentType.Component,
    ContentType.Theme,
  ]

  constructor(
    private itemManager: ItemManager,
    private sessionManager: SNSessionManager,
    private protocolService: SNProtocolService,
    private storageService: SNStorageService,
    private payloadManager: PayloadManager,
    private apiService: SNApiService,
    private historyService: SNHistoryManager,
    private readonly options: ApplicationSyncOptions,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
    this.opStatus = this.initializeStatus()
  }

  /**
   * If the database has been newly created (because its new or was previously destroyed)
   * we want to reset any sync tokens we have.
   */
  public async onNewDatabaseCreated(): Promise<void> {
    if (await this.getLastSyncToken()) {
      await this.clearSyncPositionTokens()
    }
  }

  public deinit(): void {
    this.dealloced = true
    ;(this.sessionManager as unknown) = undefined
    ;(this.itemManager as unknown) = undefined
    ;(this.protocolService as unknown) = undefined
    ;(this.payloadManager as unknown) = undefined
    ;(this.storageService as unknown) = undefined
    ;(this.apiService as unknown) = undefined
    this.opStatus.reset()
    ;(this.opStatus as unknown) = undefined
    this.resolveQueue.length = 0
    this.spawnQueue.length = 0
    super.deinit()
  }

  private initializeStatus() {
    return new SyncOpStatus(setInterval, (event) => {
      void this.notifyEvent(event)
    })
  }

  public lockSyncing(): void {
    this.clientLocked = true
  }

  public unlockSyncing(): void {
    this.clientLocked = false
  }

  public isOutOfSync(): boolean {
    return this.outOfSync
  }

  public getLastSyncDate(): Date | undefined {
    return this.lastSyncDate
  }

  public getSyncStatus(): SyncOpStatus {
    return this.opStatus
  }

  /**
   * Called by application when sign in or registration occurs.
   */
  public resetSyncState(): void {
    this.lastPreSyncSave = undefined
    this.lastSyncDate = undefined
    this.outOfSync = false
  }

  public isDatabaseLoaded(): boolean {
    return this.databaseLoaded
  }

  /**
   * Used in tandem with `loadDatabasePayloads`
   */
  public async getDatabasePayloads(): Promise<RawPayload[]> {
    return this.storageService.getAllRawPayloads().catch((error) => {
      void this.notifyEvent(SyncEvent.DatabaseReadError, error)
      throw error
    }) as Promise<RawPayload[]>
  }

  /**
   * @param rawPayloads - use `getDatabasePayloads` to get these payloads.
   * They are fed as a parameter so that callers don't have to await the loading, but can
   * await getting the raw payloads from storage
   */
  public async loadDatabasePayloads(rawPayloads: RawPayload[]): Promise<void> {
    if (this.databaseLoaded) {
      throw 'Attempting to initialize already initialized local database.'
    }

    if (rawPayloads.length === 0) {
      this.databaseLoaded = true
      this.opStatus.setDatabaseLoadStatus(0, 0, true)
      return
    }

    const unsortedPayloads = rawPayloads
      .map((rawPayload) => {
        try {
          return CreateMaxPayloadFromAnyObject(rawPayload)
        } catch (e) {
          console.error('Creating payload failed', e)
          return undefined
        }
      })
      .filter((payload) => !isNullOrUndefined(payload))

    const payloads = SortPayloadsByRecentAndContentPriority(
      unsortedPayloads as PurePayload[],
      this.localLoadPriorty,
    )
    /** Decrypt and map items keys first */
    const itemsKeysPayloads = payloads.filter((payload: PurePayload) => {
      return payload.content_type === ContentType.ItemsKey
    })
    subtractFromArray(payloads, itemsKeysPayloads)

    const decryptedItemsKeys = await this.protocolService.payloadsByDecryptingPayloads(
      itemsKeysPayloads,
    )
    await this.payloadManager.emitPayloads(decryptedItemsKeys, PayloadSource.LocalRetrieved)

    /**
     * Map in batches to give interface a chance to update. Note that total decryption
     * time is constant regardless of batch size. Decrypting 3000 items all at once or in
     * batches will result in the same time spent. It's the emitting/painting/rendering
     * that requires batch size optimization.
     */
    const payloadCount = payloads.length
    const batchSize = this.options.loadBatchSize
    const numBatches = Math.ceil(payloadCount / batchSize)
    for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
      const currentPosition = batchIndex * batchSize
      const batch = payloads.slice(currentPosition, currentPosition + batchSize)
      const decrypted = await this.protocolService.payloadsByDecryptingPayloads(batch)
      await this.payloadManager.emitPayloads(decrypted, PayloadSource.LocalRetrieved)
      void this.notifyEvent(SyncEvent.LocalDataIncrementalLoad)
      this.opStatus.setDatabaseLoadStatus(currentPosition, payloadCount, false)
      await sleep(1, false)
    }

    this.databaseLoaded = true
    this.opStatus.setDatabaseLoadStatus(0, 0, true)
  }

  private async setLastSyncToken(token: string) {
    this.syncToken = token
    return this.storageService.setValue(StorageKey.LastSyncToken, token)
  }

  private async setPaginationToken(token: string) {
    this.cursorToken = token
    if (token) {
      return this.storageService.setValue(StorageKey.PaginationToken, token)
    } else {
      return this.storageService.removeValue(StorageKey.PaginationToken)
    }
  }

  private async getLastSyncToken() {
    if (!this.syncToken) {
      this.syncToken = await this.storageService.getValue(StorageKey.LastSyncToken)
    }
    return this.syncToken as string
  }

  private async getPaginationToken() {
    if (!this.cursorToken) {
      this.cursorToken = await this.storageService.getValue(StorageKey.PaginationToken)
    }
    return this.cursorToken as string
  }

  private async clearSyncPositionTokens() {
    this.syncToken = undefined
    this.cursorToken = undefined
    await this.storageService.removeValue(StorageKey.LastSyncToken)
    await this.storageService.removeValue(StorageKey.PaginationToken)
  }

  private itemsNeedingSync() {
    return this.itemManager.getDirtyItems()
  }

  /**
   * Mark all items as dirty and needing sync, then persist to storage.
   */
  public async markAllItemsAsNeedingSync(): Promise<void> {
    this.log('Marking all items as needing sync')
    const items = this.itemManager.items
    const payloads = items.map((item) => {
      return CreateMaxPayloadFromAnyObject(item, {
        dirty: true,
        dirtiedDate: new Date(),
      })
    })
    await this.payloadManager.emitPayloads(payloads, PayloadSource.LocalChanged)
    await this.persistPayloads(payloads)
  }

  /**
   * Return the payloads that need local persistence, before beginning a sync.
   * This way, if the application is closed before a sync request completes,
   * pending data will be saved to disk, and synced the next time the app opens.
   */
  private popPayloadsNeedingPreSyncSave(from: PurePayload[]) {
    const lastPreSyncSave = this.lastPreSyncSave
    if (!lastPreSyncSave) {
      return from
    }
    /** dirtiedDate can be null if the payload was created as dirty */
    const payloads = from.filter((candidate) => {
      return !candidate.dirtiedDate || candidate.dirtiedDate > lastPreSyncSave
    })
    this.lastPreSyncSave = new Date()
    return payloads
  }

  private queueStrategyResolveOnNext(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.resolveQueue.push({ resolve, reject })
    })
  }

  private queueStrategyForceSpawnNew(options: SyncOptions) {
    return new Promise((resolve, reject) => {
      this.spawnQueue.push({ resolve, reject, options })
    })
  }

  /**
   * For timing strategy SyncQueueStrategy.ForceSpawnNew, we will execute a whole sync request
   * and pop it from the queue.
   */
  private popSpawnQueue() {
    if (this.spawnQueue.length === 0) {
      return null
    }
    const promise = this.spawnQueue[0]
    removeFromIndex(this.spawnQueue, 0)
    this.log('Syncing again from spawn queue')
    return this.sync({
      queueStrategy: SyncQueueStrategy.ForceSpawnNew,
      source: SyncSource.SpawnQueue,
      ...promise.options,
    })
      .then(() => {
        promise.resolve()
      })
      .catch(() => {
        promise.reject()
      })
  }

  private async payloadsByPreparingForServer(payloads: PurePayload[]) {
    return this.protocolService.payloadsByEncryptingPayloads(payloads, EncryptionIntent.Sync)
  }

  public async downloadFirstSync(
    waitTimeOnFailureMs: number,
    otherSyncOptions?: Partial<SyncOptions>,
  ): Promise<void> {
    const maxTries = 5
    for (let i = 0; i < maxTries; i++) {
      await this.sync({
        mode: SyncMode.DownloadFirst,
        queueStrategy: SyncQueueStrategy.ForceSpawnNew,
        source: SyncSource.External,
        ...otherSyncOptions,
      }).catch(console.error)
      if (this.completedOnlineDownloadFirstSync) {
        return
      } else {
        await sleep(waitTimeOnFailureMs)
      }
    }
    console.error(`Failed downloadFirstSync after ${maxTries} tries`)
  }

  public async awaitCurrentSyncs(): Promise<void> {
    await this.lastSyncInvokationPromise
    await this.currentSyncRequestPromise
  }

  public async sync(options: Partial<SyncOptions> = {}): Promise<unknown> {
    if (this.clientLocked) {
      this.log('Sync locked by client')
      return
    }

    const fullyResolvedOptions: SyncOptions = {
      source: SyncSource.External,
      ...options,
    }

    this.lastSyncInvokationPromise = this.performSync(fullyResolvedOptions)
    return this.lastSyncInvokationPromise
  }

  private async prepareForSync(options: SyncOptions) {
    const items = this.itemsNeedingSync()

    /**
     * Freeze the begin date immediately after getting items needing sync. This way an
     * item dirtied at any point after this date is marked as needing another sync
     */
    const beginDate = new Date()

    /**
     * Items that have never been synced and marked as deleted should not be
     * uploaded to server, and instead deleted directly after sync completion.
     */
    const neverSyncedDeleted = items.filter((item) => {
      return item.neverSynced && item.deleted
    })
    subtractFromArray(items, neverSyncedDeleted)

    const decryptedPayloads = items.map((item) => {
      return item.payloadRepresentation()
    })

    const payloadsNeedingSave = this.popPayloadsNeedingPreSyncSave(decryptedPayloads)
    await this.persistPayloads(payloadsNeedingSave)

    if (options.onPresyncSave) {
      options.onPresyncSave()
    }

    return { items, beginDate, decryptedPayloads, neverSyncedDeleted }
  }

  /**
   * Allows us to lock this function from triggering duplicate network requests.
   * There are two types of locking checks:
   * 1. syncLocked(): If a call to sync() call has begun preparing to be sent to the server.
   *                  but not yet completed all the code below before reaching that point.
   *                  (before reaching opStatus.setDidBegin).
   * 2. syncOpInProgress: If a sync() call is in flight to the server.
   */
  private configureSyncLock() {
    const syncInProgress = this.opStatus.syncInProgress
    const databaseLoaded = this.databaseLoaded
    const canExecuteSync = !this.syncLock
    const shouldExecuteSync = canExecuteSync && databaseLoaded && !syncInProgress

    if (shouldExecuteSync) {
      this.syncLock = true
    } else {
      this.log(
        !canExecuteSync
          ? 'Another function call has begun preparing for sync.'
          : syncInProgress
          ? 'Attempting to sync while existing sync in progress.'
          : 'Attempting to sync before local database has loaded.',
      )
    }

    const releaseLock = () => {
      this.syncLock = false
    }

    return { shouldExecuteSync, releaseLock }
  }

  private deferSyncRequest(options: SyncOptions) {
    const useStrategy = !isNullOrUndefined(options.queueStrategy)
      ? options.queueStrategy
      : SyncQueueStrategy.ResolveOnNext

    if (useStrategy === SyncQueueStrategy.ResolveOnNext) {
      return this.queueStrategyResolveOnNext()
    } else if (useStrategy === SyncQueueStrategy.ForceSpawnNew) {
      return this.queueStrategyForceSpawnNew({
        mode: options.mode,
        checkIntegrity: options.checkIntegrity,
        source: options.source,
      })
    } else {
      throw Error(`Unhandled timing strategy ${useStrategy}`)
    }
  }

  private async prepareForSyncExecution(
    items: SNItem[],
    inTimeResolveQueue: SyncPromise[],
    beginDate: Date,
  ) {
    this.opStatus.setDidBegin()

    await this.notifyEvent(SyncEvent.SyncWillBegin)

    /**
     * Subtract from array as soon as we're sure they'll be called.
     * resolves are triggered at the end of this function call
     */
    subtractFromArray(this.resolveQueue, inTimeResolveQueue)

    /**
     * lastSyncBegan must be set *after* any point we may have returned above.
     * Setting this value means the item was 100% sent to the server.
     */
    if (items.length > 0) {
      await this.itemManager.changeItems(
        Uuids(items),
        (mutator) => {
          mutator.lastSyncBegan = beginDate
        },
        MutationType.NonDirtying,
        PayloadSource.PreSyncSave,
      )
    }
  }

  /**
   * The InTime resolve queue refers to any sync requests that were made while we still
   * have not sent out the current request. So, anything in the InTime resolve queue
   * will have made it "in time" to piggyback on the current request. Anything that comes
   * after InTime will schedule a new sync request.
   */
  private getPendingRequestsMadeInTimeToPiggyBackOnCurrentRequest() {
    return this.resolveQueue.slice()
  }

  private async prepareSyncOperationPayloads(payloads: PurePayload[], options: SyncOptions) {
    const online = this.sessionManager.online()
    const useMode = ((tryMode) => {
      if (online && !this.completedOnlineDownloadFirstSync) {
        return SyncMode.DownloadFirst
      } else if (tryMode != undefined) {
        return tryMode
      } else {
        return SyncMode.Default
      }
    })(options.mode)

    let uploadPayloads: PurePayload[] = []
    if (useMode === SyncMode.Default) {
      if (online && !this.completedOnlineDownloadFirstSync) {
        throw Error('Attempting to default mode sync without having completed initial.')
      }
      if (online) {
        uploadPayloads = await this.payloadsByPreparingForServer(payloads)
      } else {
        uploadPayloads = payloads
      }
    } else if (useMode === SyncMode.DownloadFirst) {
      uploadPayloads = []
    }

    return { uploadPayloads, syncMode: useMode, online }
  }

  private async createSyncOperation(
    payloads: PurePayload[],
    options: SyncOptions,
    syncMode: SyncMode,
  ) {
    let operation: AccountSyncOperation | OfflineSyncOperation
    if (this.sessionManager.online()) {
      operation = await this.syncOnlineOperation(
        payloads,
        options.checkIntegrity ? true : false,
        options.source,
        syncMode,
      )
    } else {
      operation = this.syncOfflineOperation(payloads, options.source, syncMode)
    }

    return operation
  }

  private async handleSyncOperationFinish(
    operation: AccountSyncOperation | OfflineSyncOperation,
    options: SyncOptions,
    neverSyncedDeleted: SNItem[],
    syncMode: SyncMode,
  ) {
    this.opStatus.setDidEnd()

    if (this.opStatus.hasError()) {
      return { hasError: true }
    }

    this.opStatus.reset()

    this.lastSyncDate = new Date()

    if (
      operation instanceof AccountSyncOperation &&
      operation.numberOfItemsInvolved >= this.majorChangeThreshold
    ) {
      void this.notifyEvent(SyncEvent.MajorDataChange)
    }

    if (neverSyncedDeleted.length > 0) {
      await this.handleNeverSyncedDeleted(neverSyncedDeleted)
    }

    if (syncMode !== SyncMode.DownloadFirst) {
      await this.notifyEvent(SyncEvent.SyncCompletedWithAllItemsUploaded, {
        source: options.source,
      })
    }

    return { hasError: false }
  }

  private async handleDownloadFirstCompletionAndSyncAgain(online: boolean, options: SyncOptions) {
    if (online) {
      this.completedOnlineDownloadFirstSync = true
    }
    await this.notifyEvent(SyncEvent.DownloadFirstSyncCompleted)
    await this.sync({
      source: SyncSource.AfterDownloadFirst,
      checkIntegrity: true,
      awaitAll: options.awaitAll,
    })
  }

  private async syncAgainByHandlingRequestsWaitingInResolveQueue(options: SyncOptions) {
    this.log('Syncing again from resolve queue')
    const promise = this.sync({
      source: SyncSource.ResolveQueue,
      checkIntegrity: options.checkIntegrity,
    })
    if (options.awaitAll) {
      await promise
    }
  }

  /**
   * As part of the just concluded sync operation, more items may have
   * been dirtied (like conflicts), and the caller may want to await the
   * full resolution of these items.
   */
  private async syncAgainByHandlingNewDirtyItems(options: SyncOptions) {
    await this.sync({
      source: SyncSource.MoreDirtyItems,
      checkIntegrity: options.checkIntegrity,
      awaitAll: options.awaitAll,
    })
  }

  /**
   * For timing strategy SyncQueueStrategy.ResolveOnNext.
   * Execute any callbacks pulled before this sync request began.
   * Calling resolve on the callbacks should be the last thing we do in this function,
   * to simulate calling .sync as if it went through straight to the end without having
   * to be queued.
   */
  private resolvePendingSyncRequestsThatMadeItInTimeOfCurrentRequest(
    inTimeResolveQueue: SyncPromise[],
  ) {
    for (const callback of inTimeResolveQueue) {
      callback.resolve()
    }
  }

  private async potentiallySyncAgainAfterSyncCompletion(
    syncMode: SyncMode,
    options: SyncOptions,
    inTimeResolveQueue: SyncPromise[],
    online: boolean,
  ) {
    if (syncMode === SyncMode.DownloadFirst) {
      await this.handleDownloadFirstCompletionAndSyncAgain(online, options)
      this.resolvePendingSyncRequestsThatMadeItInTimeOfCurrentRequest(inTimeResolveQueue)
      return true
    }

    const didSpawnNewRequest = this.popSpawnQueue()
    const resolveQueueHasRequestsThatDidntMakeItInTime = this.resolveQueue.length > 0
    if (!didSpawnNewRequest && resolveQueueHasRequestsThatDidntMakeItInTime) {
      await this.syncAgainByHandlingRequestsWaitingInResolveQueue(options)
      this.resolvePendingSyncRequestsThatMadeItInTimeOfCurrentRequest(inTimeResolveQueue)
      return true
    }

    const newItemsNeedingSync = this.itemsNeedingSync()
    if (newItemsNeedingSync.length > 0) {
      await this.syncAgainByHandlingNewDirtyItems(options)
      this.resolvePendingSyncRequestsThatMadeItInTimeOfCurrentRequest(inTimeResolveQueue)
      return true
    }

    return false
  }

  private async performSync(options: SyncOptions): Promise<unknown> {
    const { shouldExecuteSync, releaseLock } = this.configureSyncLock()

    const { items, beginDate, decryptedPayloads, neverSyncedDeleted } = await this.prepareForSync(
      options,
    )

    const inTimeResolveQueue = this.getPendingRequestsMadeInTimeToPiggyBackOnCurrentRequest()

    if (!shouldExecuteSync) {
      return this.deferSyncRequest(options)
    }

    if (this.dealloced) {
      return
    }

    await this.prepareForSyncExecution(items, inTimeResolveQueue, beginDate)

    const { uploadPayloads, syncMode, online } = await this.prepareSyncOperationPayloads(
      decryptedPayloads,
      options,
    )

    const operation = await this.createSyncOperation(uploadPayloads, options, syncMode)

    const operationPromise = operation.run()

    this.currentSyncRequestPromise = operationPromise

    await operationPromise

    if (this.dealloced) {
      return
    }

    releaseLock()

    const { hasError } = await this.handleSyncOperationFinish(
      operation,
      options,
      neverSyncedDeleted,
      syncMode,
    )
    if (hasError) {
      return
    }

    const didSyncAgain = await this.potentiallySyncAgainAfterSyncCompletion(
      syncMode,
      options,
      inTimeResolveQueue,
      online,
    )
    if (didSyncAgain) {
      return
    }

    if (options.checkIntegrity) {
      await this.notifyEventSync(SyncEvent.SyncRequestsIntegrityCheck, {
        source: options.source as SyncSource,
      })
    }

    await this.notifyEventSync(SyncEvent.SyncCompletedWithAllItemsUploadedAndDownloaded, {
      source: options.source,
    })

    this.resolvePendingSyncRequestsThatMadeItInTimeOfCurrentRequest(inTimeResolveQueue)
  }

  private async syncOnlineOperation(
    payloads: PurePayload[],
    checkIntegrity: boolean,
    source: SyncSource,
    mode: SyncMode,
  ) {
    const syncToken = await this.getLastSyncToken()
    const paginationToken = await this.getPaginationToken()
    const operation = new AccountSyncOperation(
      payloads,
      async (type: SyncSignal, response?: SyncResponse, stats?: SyncStats) => {
        switch (type) {
          case SyncSignal.Response:
            if (this.dealloced) {
              return
            }
            if (response?.hasError) {
              this.handleErrorServerResponse(response)
            } else if (response) {
              await this.handleSuccessServerResponse(operation, response)
            }
            break
          case SyncSignal.StatusChanged:
            if (stats) {
              this.opStatus.setUploadStatus(stats.completedUploadCount, stats.totalUploadCount)
            }
            break
        }
      },
      syncToken,
      paginationToken,
      this.apiService,
    )
    this.log(
      'Syncing online user',
      `source: ${SyncSource[source]}`,
      `operation id: ${operation.id}`,
      `integrity check: ${checkIntegrity}`,
      `mode: ${mode}`,
      `syncToken: ${syncToken}`,
      `cursorToken: ${paginationToken}`,
      'payloads:',
      payloads,
    )
    return operation
  }

  private syncOfflineOperation(payloads: PurePayload[], source: SyncSource, mode: SyncMode) {
    this.log('Syncing offline user', 'source:', source, 'mode:', mode, 'payloads:', payloads)
    const operation = new OfflineSyncOperation(
      payloads,
      async (type: SyncSignal, response?: SyncResponse) => {
        if (this.dealloced) {
          return
        }
        if (type === SyncSignal.Response && response) {
          await this.handleOfflineResponse(response)
        }
      },
    )
    return operation
  }

  private async handleOfflineResponse(response: SyncResponse) {
    this.log('Offline Sync Response', response.rawResponse)
    const payloadsToEmit = response.savedPayloads
    if (payloadsToEmit.length > 0) {
      await this.payloadManager.emitPayloads(payloadsToEmit, PayloadSource.LocalSaved)
      const payloadsToPersist = this.payloadManager.find(Uuids(payloadsToEmit)) as PurePayload[]
      await this.persistPayloads(payloadsToPersist)
    }

    const deletedPayloads = response.deletedPayloads
    if (deletedPayloads.length > 0) {
      await this.deletePayloads(deletedPayloads)
    }

    this.opStatus.clearError()
    this.opStatus.setDownloadStatus(response.retrievedPayloads.length)

    await this.notifyEvent(SyncEvent.SingleRoundTripSyncCompleted, response)
  }

  private handleErrorServerResponse(response: SyncResponse) {
    this.log('Sync Error', response)
    if (response.status === INVALID_SESSION_RESPONSE_STATUS) {
      void this.notifyEvent(SyncEvent.InvalidSession)
    }

    this.opStatus?.setError(response.error)
    void this.notifyEvent(SyncEvent.SyncError, response.error)
  }

  private async handleSuccessServerResponse(
    operation: AccountSyncOperation,
    response: SyncResponse,
  ) {
    if (this._simulate_latency) {
      await sleep(this._simulate_latency.latency)
    }
    this.log('Online Sync Response', 'operation id', operation.id, response.rawResponse)

    this.opStatus.clearError()
    this.opStatus.setDownloadStatus(response.retrievedPayloads.length)

    const decryptedPayloads = []
    const processedPayloads = response.allProcessedPayloads
    const processedItemsKeys: Record<UuidString, PurePayload> = {}
    for (const payload of processedPayloads) {
      if (payload.deleted || !payload.fields.includes(PayloadField.Content)) {
        /* Deleted payloads, and some payload types
          do not contiain content (like remote saved) */
        continue
      }
      const itemsKeyPayload: PurePayload | undefined =
        processedItemsKeys[payload.items_key_id as string]
      const itemsKey = itemsKeyPayload
        ? (CreateItemFromPayload(itemsKeyPayload) as SNItemsKey)
        : undefined
      const decrypted = await this.protocolService.payloadByDecryptingPayload(payload, itemsKey)
      if (decrypted.content_type === ContentType.ItemsKey) {
        processedItemsKeys[decrypted.uuid] = decrypted
      }
      decryptedPayloads.push(decrypted)
    }
    const masterCollection = this.payloadManager.getMasterCollection()
    const historyMap = this.historyService.getHistoryMapCopy()
    const resolver = new SyncResponseResolver(
      response,
      decryptedPayloads,
      masterCollection,
      operation.payloadsSavedOrSaving,
      historyMap,
    )

    const collections = await resolver.collectionsByProcessingResponse()
    for (const collection of collections) {
      const payloadsToPersist = await this.payloadManager.emitCollection(collection)
      await this.persistPayloads(payloadsToPersist)
    }
    const deletedPayloads = response.deletedPayloads
    if (deletedPayloads.length > 0) {
      await this.deletePayloads(deletedPayloads)
    }

    await Promise.all([
      this.setLastSyncToken(response.lastSyncToken as string),
      this.setPaginationToken(response.paginationToken as string),
      this.notifyEvent(SyncEvent.SingleRoundTripSyncCompleted, response),
    ])
  }

  /**
   * Items that have never been synced and marked as deleted should be cleared
   * as dirty, mapped, then removed from storage.
   */
  private async handleNeverSyncedDeleted(items: SNItem[]) {
    const payloads = items.map((item) => {
      return item.payloadRepresentation({
        dirty: false,
      })
    })
    await this.payloadManager.emitPayloads(payloads, PayloadSource.LocalChanged)
    await this.persistPayloads(payloads)
  }

  /**
   * @param payloads The decrypted payloads to persist
   */
  public async persistPayloads(payloads: PurePayload[]) {
    if (payloads.length === 0 || this.dealloced) {
      return
    }
    return this.storageService.savePayloads(payloads).catch((error) => {
      void this.notifyEvent(SyncEvent.DatabaseWriteError, error)
      SNLog.error(error)
    })
  }

  private async deletePayloads(payloads: PurePayload[]) {
    return this.persistPayloads(payloads)
  }

  setInSync(isInSync: boolean): void {
    if (isInSync === !this.outOfSync) {
      return
    }

    if (isInSync) {
      this.outOfSync = false
      void this.notifyEvent(SyncEvent.ExitOutOfSync)
    } else {
      this.outOfSync = true
      void this.notifyEvent(SyncEvent.EnterOutOfSync)
    }
  }

  async handleEvent(event: InternalEventInterface): Promise<void> {
    if (event.type !== IntegrityEvent.IntegrityCheckCompleted) {
      return
    }

    const eventPayload: IntegrityEventPayload = event.payload as IntegrityEventPayload

    const rawPayloads = eventPayload.rawPayloads

    if (rawPayloads.length === 0) {
      this.setInSync(true)
      return
    }

    const encryptedPayloads = filterDisallowedRemotePayloads(
      rawPayloads.map((rawPayload: RawPayload) => {
        return CreateSourcedPayloadFromObject(rawPayload, PayloadSource.RemoteRetrieved)
      }),
    )
    const decryptedPayloads = await this.protocolService.payloadsByDecryptingPayloads(
      encryptedPayloads,
    )

    this.setInSync(false)

    await this.emitOutOfSyncRemotemPayloads(decryptedPayloads)

    const shouldCheckIntegrityAgainAfterSync = eventPayload.source !== SyncSource.ResolveOutOfSync

    await this.sync({
      checkIntegrity: shouldCheckIntegrityAgainAfterSync,
      source: SyncSource.ResolveOutOfSync,
    })
  }

  private async emitOutOfSyncRemotemPayloads(payloads: PayloadInterface[]) {
    const delta = new DeltaOutOfSync(
      this.payloadManager.getMasterCollection(),
      ImmutablePayloadCollection.WithPayloads(payloads, PayloadSource.RemoteRetrieved),
      undefined,
      this.historyService.getHistoryMapCopy(),
    )
    const collection = await delta.resultingCollection()
    await this.payloadManager.emitCollection(collection)
    await this.persistPayloads(collection.payloads)
  }

  /** @e2e_testing */
  // eslint-disable-next-line camelcase
  ut_setDatabaseLoaded(loaded: boolean): void {
    this.databaseLoaded = loaded
  }

  /** @e2e_testing */
  // eslint-disable-next-line camelcase
  ut_clearLastSyncDate(): void {
    this.lastSyncDate = undefined
  }

  /** @e2e_testing */
  // eslint-disable-next-line camelcase
  ut_beginLatencySimulator(latency: number): void {
    this._simulate_latency = {
      latency: latency || 1000,
      enabled: true,
    }
  }

  /** @e2e_testing */
  // eslint-disable-next-line camelcase
  ut_endLatencySimulator(): void {
    this._simulate_latency = undefined
  }
}

import { SyncSource } from '@standardnotes/services'

export enum SyncQueueStrategy {
  /**
   * Promise will be resolved on the next sync request after the current one completes.
   * If there is no scheduled sync request, one will be scheduled.
   */
  ResolveOnNext = 1,
  /**
   * A new sync request is guarenteed to be generated for your request, no matter how long it takes.
   * Promise will be resolved whenever this sync request is processed in the serial queue.
   */
  ForceSpawnNew = 2,
}

export enum SyncMode {
  /**
   * Performs a standard sync, uploading any dirty items and retrieving items.
   */
  Default = 1,
  /**
   * The first sync for an account, where we first want to download all remote items first
   * before uploading any dirty items. This allows a consumer, for example, to download
   * all data to see if user has an items key, and if not, only then create a new one.
   */
  DownloadFirst = 2,
}

export type SyncOptions = {
  queueStrategy?: SyncQueueStrategy
  mode?: SyncMode
  /** Whether the server should compute and return an integrity hash. */
  checkIntegrity?: boolean
  /** Internally used to keep track of how sync requests were spawned. */
  source: SyncSource
  /** Whether to await any sync requests that may be queued from this call. */
  awaitAll?: boolean
  /**
   * A callback that is triggered after pre-sync save completes,
   * and before the sync request is network dispatched
   */
  onPresyncSave?: () => void
}

export type SyncPromise = {
  resolve: (value?: unknown) => void
  reject: () => void
  options?: SyncOptions
}

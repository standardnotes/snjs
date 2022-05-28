export enum PayloadEmitSource {
  /** When an observer registers to stream items, the items are pushed immediately to the observer */
  InitialObserverRegistrationPush = 1,

  InternalChange,

  /**
   * Payload when a client modifies item property then maps it to update UI.
   * This also indicates that the item was dirtied
   */
  LocalChanged,
  LocalInserted,
  LocalDatabaseLoaded,
  /** The payload returned by offline sync operation */
  OfflineSyncSaved,
  LocalRetrieved,

  FileImport,

  ComponentRetrieved,
  /** Payloads received from an external component with the intention of creating a new item */
  ComponentCreated,

  /**
   * When the payloads are about to sync, they are emitted by the sync service with updated
   * values of lastSyncBegan. Payloads emitted from this source indicate that these payloads
   * have been saved to disk, and are about to be synced
   */
  PreSyncSave,

  RemoteRetrieved,
  RemoteSaved,
}

export function isPayloadSourceNotInterestingToClients(source: PayloadEmitSource): boolean {
  return [
    PayloadEmitSource.InternalChange,
    PayloadEmitSource.RemoteSaved,
    PayloadEmitSource.PreSyncSave,
    PayloadEmitSource.OfflineSyncSaved,
  ].includes(source)
}

export function isPayloadSourceRetrieved(source: PayloadEmitSource): boolean {
  return [PayloadEmitSource.RemoteRetrieved, PayloadEmitSource.ComponentRetrieved].includes(source)
}

export enum PayloadSource {
  /** When an observer registers to stream items, the items are pushed immediately to the observer */
  InitialObserverRegistrationPush = 1,
  RemoteRetrieved,
  RemoteSaved,

  /** The payload returned by offline sync operation */
  LocalSaved,
  LocalRetrieved,

  /**
   * Payload when a client modifies item property then maps it to update UI.
   * This also indicates that the item was dirtied
   */
  LocalChanged,

  /** Payloads retrieved from an external extension/component */
  ComponentRetrieved,

  /** When a component is installed by the desktop and some of its values change */
  DesktopInstalled,

  /** Action-based extensions like note history */
  RemoteActionRetrieved,
  FileImport,
  RemoteConflict,
  ImportConflict,

  /**
   * Payloads that have been decrypted for the convenience of consumers who can only work with
   * decrypted formats. The decrypted payloads exist in transient, ephemeral space,
   * and are not used in anyway.
   */
  PossiblyDecryptedSyncPostProcessed,

  ConflictUuid,
  ConflictData,
  SessionHistory,

  /**
   * Payloads with a source of Constructor means that the payload was created
   * in isolated space by the caller, and does not yet have any app-related affiliation.
   */
  Constructor,

  /** Payloads received from an external component with the intention of creating a new item */
  ComponentCreated,

  /**
   * When the payloads are about to sync, they are emitted by the sync service with updated
   * values of lastSyncBegan. Payloads emitted from this source indicate that these payloads
   * have been saved to disk, and are about to be synced
   */
  PreSyncSave,

  RemoteHistory,

  /** Payloads which have been rejected and unwilling to be saved by the server */
  RemoteRejected,
}

/**
 * Whether the changed payload represents only an internal change that shouldn't
 * require a UI refresh
 */
export function isPayloadSourceInternalChange(source: PayloadSource): boolean {
  return [PayloadSource.RemoteSaved, PayloadSource.PreSyncSave].includes(source)
}

export function isPayloadSourceRetrieved(source: PayloadSource): boolean {
  return [
    PayloadSource.RemoteRetrieved,
    PayloadSource.ComponentRetrieved,
    PayloadSource.RemoteActionRetrieved,
  ].includes(source)
}

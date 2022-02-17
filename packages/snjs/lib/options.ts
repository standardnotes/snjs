export interface SyncOptions {
  /**
   * The size of the item batch to decrypt and render upon application load.
   */
  loadBatchSize: number;
}

export interface FileOptions {
  /** The size in bytes for new file uploads. */
  filesChunkSize: number;
}

export type ApplicationOptions = SyncOptions & FileOptions;

export const ApplicationOptionsDefaults: ApplicationOptions = {
  loadBatchSize: 700,
  filesChunkSize: 1_000_00,
};

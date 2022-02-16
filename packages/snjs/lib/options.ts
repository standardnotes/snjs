export interface ApplicationOptions {
  /**
   * The size of the item batch to decrypt and render upon application load.
   */
  loadBatchSize: number;
}

export const ApplicationOptionsDefaults: ApplicationOptions = {
  loadBatchSize: 700,
};

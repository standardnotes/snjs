export type OnChunkCallback = (
  chunk: Uint8Array,
  index: number,
  isLast: boolean,
) => Promise<void>

export type FileSelectionResponse = {
  name: string
  ext: string
}

export type ChunkDiskPusher = (chunk: Uint8Array) => Promise<void>

export type ChunkDiskCloser = () => Promise<void>

export interface StreamingFilePickerInterface {
  /** This function must be called in response to a user interaction, otherwise, it will be rejected by the browser. */
  selectFileAndStream(onChunk: OnChunkCallback): Promise<FileSelectionResponse>

  /** This function must be called in response to a user interaction, otherwise, it will be rejected by the browser. */
  saveFile(): Promise<{ pusher: ChunkDiskPusher; closer: ChunkDiskCloser }>
}

export interface ClassicFilePickerInterface {
  /**
   * This function must be called in response to a user interaction, otherwise, it will be rejected by the browser.
   * The classif file picker does not support reading file in chunks. However, for the convenience of the caller, the
   * file is fully loaded into memory all at once, but delivered to the caller in chunks.
   */
  readFileAndSplit(onChunk: OnChunkCallback): Promise<FileSelectionResponse>

  saveFile(name: string, bytes: Uint8Array): void
}

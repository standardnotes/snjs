import { ByteChunker } from './byte_chunker'
import { getFileMetadata } from '.'
import { OnChunkCallback, FileSelectionResponse } from './types'

/**
 * The File System Access API File Picker
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export class StreamingFileReader {
  public loggingEnabled = false
  private byteChunker: ByteChunker

  constructor(minimumChunkSize: number, onChunk: OnChunkCallback) {
    this.byteChunker = new ByteChunker(minimumChunkSize, onChunk)
  }

  private log(...args: any[]): void {
    if (!this.loggingEnabled) {
      return
    }
    console.log(args)
  }

  static available(): boolean {
    return window.showOpenFilePicker != undefined
  }

  /** This function must be called in response to a user interaction, otherwise, it will be rejected by the browser. */
  public async selectFileAndStream(): Promise<FileSelectionResponse> {
    const selectedFilesHandles = await window.showOpenFilePicker()
    const uploadHandle = selectedFilesHandles[0]

    const file = await uploadHandle.getFile()
    const stream = (file.stream() as unknown) as ReadableStream
    const reader = stream.getReader()

    let previousChunk: Uint8Array

    const processChunk = async ({
      done,
      value,
    }: {
      done: boolean
      value: never
    }): Promise<void> => {
      if (done) {
        this.log('Reader did read final chunk', previousChunk.length)
        await this.byteChunker.addBytes(previousChunk, true)
        return
      }

      if (previousChunk) {
        this.log('Reader did read decrypted chunk', previousChunk.length)
        await this.byteChunker.addBytes(previousChunk, false)
      }

      previousChunk = value

      return reader.read().then(processChunk)
    }

    await reader.read().then(processChunk)

    this.log('Finished streaming file.')

    return getFileMetadata(file)
  }
}

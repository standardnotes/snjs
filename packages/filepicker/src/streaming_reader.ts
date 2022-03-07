import { ByteChunker } from './byte_chunker'
import { parseFileName } from '.'
import { OnChunkCallback, FileSelectionResponse } from './types'

/**
 * The File System Access API File Picker
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export class StreamingFileReader {
  public loggingEnabled = false
  private byteChunker: ByteChunker
  private selectedFile?: File

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

  public async selectFile(): Promise<File> {
    const selectedFilesHandles = await window.showOpenFilePicker()
    const uploadHandle = selectedFilesHandles[0]

    this.selectedFile = await uploadHandle.getFile()

    return this.selectedFile
  }

  public async beginReadingFile(): Promise<FileSelectionResponse> {
    if (!this.selectedFile) {
      throw Error('Attempting to read file before selecting')
    }

    const stream = this.selectedFile.stream() as unknown as ReadableStream
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

    return parseFileName(this.selectedFile.name)
  }
}

import { getFileMetadata } from './utils'
import { OnChunkCallback, FileSelectionResponse } from './types'
import { readFile } from './utils'

export class ClassicFileReader {
  public loggingEnabled = false

  constructor(
    private minimumChunkSize: number,
    private onChunk: OnChunkCallback,
  ) {}

  private log(...args: any[]): void {
    if (!this.loggingEnabled) {
      return
    }
    console.log(args)
  }

  static maximumFileSize(): number {
    return 50 * 1_000_000
  }

  selectFileAndStream(): Promise<FileSelectionResponse> {
    const input = document.createElement('input') as HTMLInputElement
    input.type = 'file'
    return new Promise((resolve) => {
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement
        const file = (target.files as FileList)[0]
        await this.readFileAndSplit(file)
        resolve(getFileMetadata(file))
      }
      input.click()
    })
  }

  private async readFileAndSplit(file: File): Promise<FileSelectionResponse> {
    const buffer = await readFile(file)

    let chunkId = 1
    for (let i = 0; i < buffer.length; i += this.minimumChunkSize) {
      const readUntil =
        i + this.minimumChunkSize > buffer.length
          ? buffer.length
          : i + this.minimumChunkSize
      const chunk = buffer.slice(i, readUntil)
      const isFinalChunk = readUntil === buffer.length

      this.log(`Pushing ${chunk.length} bytes`)
      await this.onChunk(chunk, chunkId++, isFinalChunk)
    }

    return getFileMetadata(file)
  }
}

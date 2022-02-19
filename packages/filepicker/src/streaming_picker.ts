import {
  StreamingFilePickerInterface,
  OnChunkCallback,
  FileSelectionResponse,
  ChunkDiskPusher,
  ChunkDiskCloser,
} from './types'

/**
 * The File System Access API File Picker
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export class StreamingFilePicker implements StreamingFilePickerInterface {
  private loggingEnabled = true

  private log(...args: any[]): void {
    if (!this.loggingEnabled) {
      return
    }
    console.log(args)
  }

  async selectFileAndStream(
    onChunk: OnChunkCallback,
  ): Promise<FileSelectionResponse> {
    const selectedFilesHandles = await window.showOpenFilePicker()
    const uploadHandle = selectedFilesHandles[0]

    const file = await uploadHandle.getFile()
    const stream = (file.stream() as unknown) as ReadableStream
    const reader = stream.getReader()

    let chunkIndex = 1
    let previousChunk: Uint8Array

    const processChunk = async ({
      done,
      value,
    }: {
      done: boolean
      value: never
    }): Promise<void> => {
      if (done) {
        this.log('Read final chunk', previousChunk.length)
        await onChunk(previousChunk, chunkIndex, true)
        return
      }

      if (previousChunk) {
        this.log('Read chunk', previousChunk.length)
        await onChunk(previousChunk, chunkIndex, false)
        chunkIndex++
      }

      previousChunk = value

      return reader.read().then(processChunk)
    }

    await reader.read().then(processChunk)

    this.log('Finished streaming file.')

    const pattern = /(?:\.([^.]+))?$/
    const extMatches = pattern.exec(file.name)
    const ext = (extMatches?.[1] as string) || ''
    const name = file.name.split('.')[0]

    return { name, ext }
  }

  async saveFile(): Promise<{
    pusher: ChunkDiskPusher
    closer: ChunkDiskCloser
  }> {
    this.log('Showing save file picker')

    const downloadHandle = await window.showSaveFilePicker()

    const writableStream = await downloadHandle.createWritable()

    const pusher = async (chunk: Uint8Array): Promise<void> => {
      this.log('Writing chunk to disk of size', chunk.length)
      await writableStream.write(chunk)
    }

    const closer = () => {
      this.log('Closing write stream')
      return writableStream.close()
    }

    return { pusher, closer }
  }
}

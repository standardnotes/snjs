import { FileReaderInterface } from './../Interface/FileReader'
import { ByteChunker } from '../Chunker/ByteChunker'
import { parseFileName } from '../utils'
import { OnChunkCallback, FileSelectionResponse } from '../types'

interface StreamingFileReaderInterface {
  getFilesFromHandles(handles: FileSystemFileHandle[]): Promise<File[]>
}

/**
 * The File System Access API File Picker
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export const StreamingFileReader: StreamingFileReaderInterface & FileReaderInterface = {
  getFilesFromHandles,
  selectFiles,
  readFile,
  available,
  maximumFileSize,
}

function maximumFileSize(): number | undefined {
  return undefined
}

function getFilesFromHandles(handles: FileSystemFileHandle[]): Promise<File[]> {
  return Promise.all(handles.map((handle) => handle.getFile()))
}

async function selectFiles(): Promise<File[]> {
  const selectedFilesHandles = await window.showOpenFilePicker({ multiple: true })
  return getFilesFromHandles(selectedFilesHandles)
}

async function readFile(
  file: File,
  minimumChunkSize: number,
  onChunk: OnChunkCallback,
): Promise<FileSelectionResponse> {
  const byteChunker = new ByteChunker(minimumChunkSize, onChunk)
  const stream = file.stream() as unknown as ReadableStream
  const reader = stream.getReader()

  let previousChunk: Uint8Array

  const processChunk = async ({ done, value }: { done: boolean; value: never }): Promise<void> => {
    if (done) {
      await byteChunker.addBytes(previousChunk, true)
      return
    }

    if (previousChunk) {
      await byteChunker.addBytes(previousChunk, false)
    }

    previousChunk = value

    return reader.read().then(processChunk)
  }

  await reader.read().then(processChunk)

  const { name, ext } = parseFileName(file.name)

  return {
    name,
    ext,
    mimeType: file.type,
  }
}

function available(): boolean {
  return window.showOpenFilePicker != undefined
}

import { OnChunkCallback, FileSelectionResponse } from '../types'
import { readFile as utilsReadFile, parseFileName } from '../utils'
import { FileReaderInterface } from '../Interface/FileReader'

export const ClassicFileReader: FileReaderInterface = {
  selectFiles,
  readFile,
  available,
  maximumFileSize,
}

function available(): boolean {
  return true
}

function maximumFileSize(): number {
  return 50 * 1_000_000
}

function selectFiles(): Promise<File[]> {
  const input = document.createElement('input') as HTMLInputElement
  input.type = 'file'
  input.multiple = true

  return new Promise((resolve) => {
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement
      const files = []
      for (const file of target.files as FileList) {
        files.push(file)
      }
      resolve(files)
    }
    input.click()
  })
}

async function readFile(
  file: File,
  minimumChunkSize: number,
  onChunk: OnChunkCallback,
): Promise<FileSelectionResponse> {
  const buffer = await utilsReadFile(file)

  let chunkId = 1
  for (let i = 0; i < buffer.length; i += minimumChunkSize) {
    const readUntil = i + minimumChunkSize > buffer.length ? buffer.length : i + minimumChunkSize
    const chunk = buffer.slice(i, readUntil)
    const isFinalChunk = readUntil === buffer.length

    await onChunk(chunk, chunkId++, isFinalChunk)
  }

  const { name, ext } = parseFileName(file.name)

  return {
    name,
    ext,
    mimeType: file.type,
  }
}

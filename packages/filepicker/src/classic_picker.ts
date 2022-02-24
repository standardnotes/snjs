import {
  ClassicFilePickerInterface,
  OnChunkCallback,
  FileSelectionResponse,
} from './types'

export class ClassicFilePicker implements ClassicFilePickerInterface {
  private loggingEnabled = true

  constructor(private file: File, private chunkSize: number) {}

  private log(...args: any[]): void {
    if (!this.loggingEnabled) {
      return
    }
    console.log(args)
  }

  private async readFile(file: File): Promise<Uint8Array> {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
    return new Promise((resolve) => {
      reader.onload = (readerEvent) => {
        const target = readerEvent.target as FileReader
        const content = target.result as ArrayBuffer
        resolve(new Uint8Array(content))
      }
    })
  }

  async readFileAndSplit(
    onChunk: OnChunkCallback,
  ): Promise<FileSelectionResponse> {
    const buffer = await this.readFile(this.file)

    let chunkId = 0
    for (let i = 0; i < buffer.length; i += this.chunkSize) {
      const readUntil =
        i + this.chunkSize > buffer.length ? buffer.length : i + this.chunkSize
      const chunk = buffer.slice(i, readUntil)
      const isFinalChunk = readUntil === buffer.length

      this.log(`Pushing ${chunk.length} bytes`)
      await onChunk(chunk, chunkId++, isFinalChunk)
    }

    const pattern = /(?:\.([^.]+))?$/
    const extMatches = pattern.exec(this.file.name)
    const ext = (extMatches?.[1] as string) || ''
    const name = this.file.name.split('.')[0]

    return { name, ext }
  }

  async saveFile(name: string, bytes: Uint8Array): Promise<void> {
    this.log('Saving file to disk...')
    const link = document.createElement('a')
    const blob = new Blob([bytes], {
      type: 'text/plain;charset=utf-8',
    })
    link.href = window.URL.createObjectURL(blob)
    link.setAttribute('download', name)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(link.href)
    this.log('Closing write stream')
  }
}

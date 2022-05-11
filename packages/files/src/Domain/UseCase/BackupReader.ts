import { FileHandleRead, FileSystemApi } from '@standardnotes/services'

export class BackupReader {
  private fileHandle!: FileHandleRead

  constructor(private fileSystem: FileSystemApi) {}

  async promptForSelection() {
    const result = await this.fileSystem.selectFile()

    if (result === 'aborted' || result === 'failed') {
      return result
    }

    this.fileHandle = result

    return 'success'
  }

  async readSelectedFile(
    onEncryptedBytes: (bytes: Uint8Array, isLast: boolean) => Promise<void>,
  ): Promise<'success' | 'aborted' | 'failed'> {
    return new Promise((resolve) => {
      const readFileResult = this.fileSystem.readFile(this.fileHandle, async (bytes, isLast) => {
        await onEncryptedBytes(bytes, isLast)

        if (isLast) {
          resolve('success')
        }
      })

      readFileResult.then((result) => {
        if (result !== 'success') {
          resolve(result)
        }
      })
    })
  }
}

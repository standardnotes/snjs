import { FileHandleRead, FileSystemApi } from '@standardnotes/services'

export async function readFile(
  fileHandle: FileHandleRead,
  fileSystem: FileSystemApi,
  onEncryptedBytes: (bytes: Uint8Array, isLast: boolean) => Promise<void>,
): Promise<'success' | 'aborted' | 'failed'> {
  return new Promise((resolve) => {
    const readFileResult = fileSystem.readFile(fileHandle, async (bytes, isLast) => {
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

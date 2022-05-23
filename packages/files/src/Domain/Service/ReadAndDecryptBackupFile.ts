import { FileContent } from '@standardnotes/models'
import { FileSystemApi, FileHandleRead } from '@standardnotes/services'
import { PureCryptoInterface } from '@standardnotes/sncrypto-common'
import { OrderedByteChunker } from '@standardnotes/filepicker'
import { FileDecryptor } from '../UseCase/FileDecryptor'

export async function readAndDecryptBackupFile(
  fileHandle: FileHandleRead,
  file: {
    encryptionHeader: FileContent['encryptionHeader']
    remoteIdentifier: FileContent['remoteIdentifier']
    encryptedChunkSizes: FileContent['encryptedChunkSizes']
    key: FileContent['key']
  },
  fileSystem: FileSystemApi,
  crypto: PureCryptoInterface,
  onDecryptedBytes: (decryptedBytes: Uint8Array) => Promise<void>,
): Promise<'aborted' | 'failed' | 'success'> {
  const decryptor = new FileDecryptor(file, crypto)

  const byteChunker = new OrderedByteChunker(file.encryptedChunkSizes, async (chunk: Uint8Array) => {
    const decryptResult = decryptor.decryptBytes(chunk)

    if (!decryptResult) {
      return
    }

    await onDecryptedBytes(decryptResult.decryptedBytes)
  })

  const readResult = await fileSystem.readFile(fileHandle, async (encryptedBytes: Uint8Array, isLast: boolean) => {
    await byteChunker.addBytes(encryptedBytes, isLast)
  })

  return readResult
}

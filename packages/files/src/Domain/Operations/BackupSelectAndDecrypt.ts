import { FileContent } from '@standardnotes/models'
import { FileSystemApi } from '@standardnotes/services'
import { PureCryptoInterface } from '@standardnotes/sncrypto-common'
import { OrderedByteChunker } from '../Utils/OrderedByteChunker'
import { BackupReader } from '../UseCase/BackupReader'
import { FileDecryptor } from '../UseCase/FileDecryptor'

export class BackupSelectAndDecrypt {
  private selector!: BackupReader

  constructor(
    private file: {
      encryptionHeader: FileContent['encryptionHeader']
      remoteIdentifier: FileContent['remoteIdentifier']
      encryptedChunkSizes: FileContent['encryptedChunkSizes']
      key: FileContent['key']
    },
    private fileSystem: FileSystemApi,
    private crypto: PureCryptoInterface,
  ) {}

  public async runSelectAndRead(
    onDecryptedBytes: (decryptedBytes: Uint8Array) => Promise<void>,
  ): Promise<'aborted' | 'failed' | 'success'> {
    const selectStatus = await this.runSelect()

    if (selectStatus !== 'success') {
      return selectStatus
    }

    return this.runRead(onDecryptedBytes)
  }

  public async runSelect(): Promise<'aborted' | 'failed' | 'success'> {
    const selector = new BackupReader(this.fileSystem)
    const selectionStatus = await selector.promptForSelection()

    if (selectionStatus !== 'success') {
      return selectionStatus
    }

    this.selector = selector

    return 'success'
  }

  public async runRead(
    onDecryptedBytes: (decryptedBytes: Uint8Array) => Promise<void>,
  ): Promise<'aborted' | 'failed' | 'success'> {
    const decryptor = new FileDecryptor(this.file, this.crypto)

    const byteChunker = new OrderedByteChunker(this.file.encryptedChunkSizes, async (chunk: Uint8Array) => {
      const decryptResult = decryptor.decryptBytes(chunk)

      if (!decryptResult) {
        return
      }

      await onDecryptedBytes(decryptResult.decryptedBytes)
    })

    const readResult = await this.selector.readSelectedFile(async (encryptedBytes: Uint8Array, isLast: boolean) => {
      await byteChunker.addBytes(encryptedBytes, isLast)
    })

    return readResult
  }
}

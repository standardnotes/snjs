export interface FilesApi {
  startUploadSession(apiToken: string): Promise<boolean>

  uploadFileBytes(apiToken: string, chunkId: number, encryptedBytes: Uint8Array): Promise<boolean>

  closeUploadSession(apiToken: string): Promise<boolean>

  downloadFile(
    file: EncryptedFileInterface,
    chunkIndex: number,
    apiToken: string,
    contentRangeStart: number,
    onBytesReceived: (bytes: Uint8Array) => void,
  ): Promise<void>
}

export interface FilesDevice {
  showFilePicker(): void
}

export interface DecryptedFileInterface {
  remoteIdentifier: string
  key: string
}

export interface EncryptedFileInterface {
  remoteIdentifier: string
  encryptionHeader: string
  key: string
  chunkSizes: number[]
}

export interface RemoteFileInterface {
  remoteIdentifier: string
}

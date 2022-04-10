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

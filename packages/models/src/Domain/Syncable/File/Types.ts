export interface DecryptedFileInterface {
  remoteIdentifier: string
  key: string
  decryptedSize: number
}

export interface EncryptedFileInterface {
  remoteIdentifier: string
  encryptionHeader: string
  key: string
  encryptedChunkSizes: number[]
  encryptedSize: number
}

export interface RemoteFileInterface {
  remoteIdentifier: string
}

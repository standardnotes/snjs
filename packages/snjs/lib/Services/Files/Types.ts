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

export type FileUploadResult = {
  encryptionHeader: string
  finalDecryptedSize: number
  key: string
  remoteIdentifier: string
}

export type FileUploadProgress = {
  decryptedFileSize: number
  decryptedBytesUploaded: number
  decryptedBytesRemaining: number
  percentComplete: number
}

export type FileDownloadProgress = {
  encryptedFileSize: number
  encryptedBytesDownloaded: number
  encryptedBytesRemaining: number
  percentComplete: number
}

export interface FilesApi {
  startUploadSession(
    apiToken: string,
  ): Promise<boolean>;

  uploadFileBytes(
    apiToken: string,
    chunkId: number,
    encryptedBytes: Uint8Array,
    ): Promise<boolean>;

  closeUploadSession(
    apiToken: string,
  ): Promise<boolean>;

  downloadFile(
    apiToken: string,
    onBytesReceived: (bytes: Uint8Array) => void
  ): Promise<void>;
}

export interface FilesDevice {
  showFilePicker(): void;
}

export interface DecryptedFileInterface {
  remoteIdentifier: string;
  key: string;
}

export interface EncryptedFileInterface {
  remoteIdentifier: string;
  encryptionHeader: string;
  key: string;
}

export interface RemoteFileInterface {
  remoteIdentifier: string;
}

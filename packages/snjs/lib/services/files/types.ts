export interface FilesApi {
  uploadFileBytes(
    remoteIdentifier: string,
    encryptedBytes: Uint8Array,
  ): Promise<{ success: boolean }>;

  downloadFile(
    remoteIdentifier: string,
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

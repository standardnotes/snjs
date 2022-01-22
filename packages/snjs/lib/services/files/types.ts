export interface ApiServiceInterface {
  uploadFileBytes(
    encryptedBytes: Uint8Array,
    remoteIdentifier: string
  ): Promise<{ success: boolean }>;

  downloadFile(
    remoteId: string,
    onBytesReceived: (bytes: Uint8Array) => void,
  ): Promise<void>;
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

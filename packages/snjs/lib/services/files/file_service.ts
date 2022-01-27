import { FillItemContent } from '@Models/functions';
import { ContentType } from '@standardnotes/common';
import { DownloadAndDecryptFileOperation } from './operations/download_and_decrypt';
import { DecryptedFileInterface } from './types';
import { EncryptAndUploadFileOperation } from './operations/encrypt_and_upload';
import { SNFile, FileProtocolV1, FileContent } from './../../models/app/file';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { PureService } from '@Services/pure_service';
import { SNAlertService } from '../alert_service';
import { SNSyncService } from '../sync/sync_service';
import { ItemManager } from '@Services/item_manager';
import { SNApiService } from '../api/api_service';
import { Uuid } from '@Lib/uuid';

export class SNFileService extends PureService {
  constructor(
    private apiService: SNApiService,
    private itemManager: ItemManager,
    private syncService: SNSyncService,
    private alertService: SNAlertService,
    private crypto: SNPureCrypto
  ) {
    super();
  }

  deinit(): void {
    super.deinit();
    (this.apiService as unknown) = undefined;
    (this.itemManager as unknown) = undefined;
    (this.syncService as unknown) = undefined;
    (this.alertService as unknown) = undefined;
    (this.crypto as unknown) = undefined;
  }

  public async beginNewFileUpload(): Promise<EncryptAndUploadFileOperation> {
    const remoteIdentifier = await Uuid.GenerateUuid();
    const apiToken = await this.apiService.createFileUploadToken(remoteIdentifier);
    const key = await this.crypto.generateRandomKey(FileProtocolV1.KeySize);
    const fileParams: DecryptedFileInterface = {
      key,
      remoteIdentifier,
    };

    const uploadOperation = new EncryptAndUploadFileOperation(
      fileParams,
      this.crypto,
      this.apiService
    );

    await uploadOperation.initializeHeader();

    return uploadOperation;
  }

  public pushBytesForUpload(
    operation: EncryptAndUploadFileOperation,
    bytes: Uint8Array,
    isFinalChunk: boolean
  ): Promise<boolean> {
    return operation.pushBytes(bytes, isFinalChunk);
  }

  public async finishUpload(
    operation: EncryptAndUploadFileOperation,
    fileName: string,
    fileExt: string
  ): Promise<SNFile> {
    const fileContent: FileContent = {
      chunkSize: FileProtocolV1.ChunkSize,
      encryptionHeader: operation.getEncryptionHeader(),
      ext: fileExt,
      key: operation.getEncryptionHeader(),
      name: fileName,
      remoteIdentifier: operation.getRemoteIdentifier(),
      size: operation.getRawSize(),
    };

    const file = await this.itemManager.createItem<SNFile>(
      ContentType.File,
      FillItemContent(fileContent),
      true
    );

    this.syncService.sync();

    return file;
  }

  public async downloadFile(
    file: SNFile,
    onDecryptedBytes: (bytes: Uint8Array) => void
  ): Promise<void> {
    const operation = new DownloadAndDecryptFileOperation(
      file,
      this.crypto,
      this.apiService,
      onDecryptedBytes
    );

    return operation.run();
  }
}

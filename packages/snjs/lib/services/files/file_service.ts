import { FillItemContent } from '@Models/functions';
import { ContentType } from '@standardnotes/common';
import { DownloadAndDecryptFileOperation } from './operations/download_and_decrypt';
import { DecryptedFileInterface } from './types';
import { EncryptAndUploadFileOperation } from './operations/encrypt_and_upload';
import { SNFile, FileProtocolV1, FileContent } from './../../models/app/file';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { SNAlertService } from '../alert_service';
import { SNSyncService } from '../sync/sync_service';
import { ItemManager } from '@Services/item_manager';
import { SNApiService } from '../api/api_service';
import { Uuid } from '@Lib/uuid';
import { isErrorObject } from '@standardnotes/utils';
import { PayloadContent } from '@Lib/protocol';
import { AbstractService } from '@standardnotes/services';

export class SNFileService extends AbstractService {
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
    const remoteIdentifier = Uuid.GenerateUuid();
    const apiToken = await this.apiService.createFileValetToken(
      remoteIdentifier,
      'write'
    );
    if (isErrorObject(apiToken)) {
      throw new Error('Could not obtain files api valet token');
    }

    const key = this.crypto.generateRandomKey(FileProtocolV1.KeySize);
    const fileParams: DecryptedFileInterface = {
      key,
      remoteIdentifier,
    };

    const uploadOperation = new EncryptAndUploadFileOperation(
      fileParams,
      apiToken,
      this.crypto,
      this.apiService
    );

    uploadOperation.initializeHeader();

    const uploadSessionStarted = await this.apiService.startUploadSession(
      apiToken
    );
    if (!uploadSessionStarted) {
      throw new Error('Could not start upload session');
    }

    return uploadOperation;
  }

  public async pushBytesForUpload(
    operation: EncryptAndUploadFileOperation,
    bytes: Uint8Array,
    chunkId: number,
    isFinalChunk: boolean
  ): Promise<boolean> {
    return operation.pushBytes(bytes, chunkId, isFinalChunk);
  }

  public async finishUpload(
    operation: EncryptAndUploadFileOperation,
    fileName: string,
    fileExt: string
  ): Promise<SNFile> {
    const uploadSessionClosed = await this.apiService.closeUploadSession(
      operation.getApiToken()
    );
    if (!uploadSessionClosed) {
      throw new Error('Could not close upload session');
    }

    console.log('Finished upload with sizes', operation.chunkSizes);

    const fileContent: FileContent = {
      chunkSizes: operation.chunkSizes,
      encryptionHeader: operation.getEncryptionHeader(),
      ext: fileExt,
      key: operation.getKey(),
      name: fileName,
      remoteIdentifier: operation.getRemoteIdentifier(),
      size: operation.getRawSize(),
    };

    const file = await this.itemManager.createItem<SNFile>(
      ContentType.File,
      FillItemContent(fileContent),
      true
    );

    await this.syncService.sync();

    return file;
  }

  public async downloadFile(
    file: SNFile,
    onDecryptedBytes: (bytes: Uint8Array) => void
  ): Promise<void> {
    const apiToken = await this.apiService.createFileValetToken(
      (file.content as PayloadContent).remoteIdentifier,
      'read'
    );
    if (isErrorObject(apiToken)) {
      throw new Error('Could not obtain files api valet token');
    }

    const operation = new DownloadAndDecryptFileOperation(
      file,
      this.crypto,
      this.apiService,
      apiToken,
      onDecryptedBytes,
      () => {
        console.error('Error downloading/decrypting file');
      }
    );

    return operation.run();
  }
}

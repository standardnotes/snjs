import { DownloadAndDecryptFileOperation } from './operations/download_and_decrypt';
import { ApiServiceInterface } from './types';
import { EncryptAndUploadFileOperation } from './operations/encrypt_and_upload';
import { SNFile, FileMutator } from './../../models/app/file';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { PureService } from '@Services/pure_service';
import { SNAlertService } from '../alert_service';
import { SNSyncService } from '../sync/sync_service';
import { ItemManager } from '@Services/item_manager';
import { SNApiService } from '../api/api_service';

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

  async createUploadOperation(
    file: SNFile
  ): Promise<EncryptAndUploadFileOperation> {
    const operation = new EncryptAndUploadFileOperation(
      file,
      this.crypto,
      (this.apiService as unknown) as ApiServiceInterface
    );

    const header = await operation.initializeHeader();

    this.itemManager.changeItem<FileMutator>(file.uuid, (mutator) => {
      mutator.encryptionHeader = header;
    });

    return operation;
  }

  public createDownloadOperation(
    file: SNFile,
    onDecryptedBytes: (decryptedBytes: Uint8Array) => void
  ): DownloadAndDecryptFileOperation {
    const operation = new DownloadAndDecryptFileOperation(
      file,
      this.crypto,
      (this.apiService as unknown) as ApiServiceInterface,
      onDecryptedBytes
    );

    return operation;
  }
}

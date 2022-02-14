import { SNFile } from './../../models/app/file';
import { SNFileService } from './file_service';
import { SNSyncService } from '../sync/sync_service';
import { ItemManager, SNAlertService, SNApiService } from '@Lib/index';
import { SNPureCrypto, StreamEncryptor } from '@standardnotes/sncrypto-common';

describe('fileService', () => {
  let apiService: SNApiService;
  let itemManager: ItemManager;
  let syncService: SNSyncService;
  let alertService: SNAlertService;
  let crypto: SNPureCrypto;
  let fileService: SNFileService;

  const createService = () => {
    return new SNFileService(
      apiService,
      itemManager,
      syncService,
      alertService,
      crypto
    );
  };

  beforeEach(() => {
    apiService = {} as jest.Mocked<SNApiService>;
    apiService.addEventObserver = jest.fn();

    itemManager = {} as jest.Mocked<ItemManager>;
    itemManager.createItem = jest.fn();
    itemManager.createTemplateItem = jest.fn().mockReturnValue({});
    itemManager.setItemsToBeDeleted = jest.fn();
    itemManager.addObserver = jest.fn();
    itemManager.changeItem = jest.fn();

    syncService = {} as jest.Mocked<SNSyncService>;
    syncService.sync = jest.fn();

    alertService = {} as jest.Mocked<SNAlertService>;
    alertService.confirm = jest.fn().mockReturnValue(true);
    alertService.alert = jest.fn();

    crypto = {} as jest.Mocked<SNPureCrypto>;
    crypto.base64Decode = jest.fn();

    crypto.xchacha20StreamInitDecryptor = jest.fn().mockReturnValue({
      state: {},
    } as StreamEncryptor);

    crypto.xchacha20StreamDecryptorPush = jest
      .fn()
      .mockReturnValue({ message: new Uint8Array([0xaa]), tag: 0 });

    crypto.xchacha20StreamInitEncryptor = jest.fn().mockReturnValue({
      header: 'some-header',
      state: {},
    } as StreamEncryptor);

    crypto.xchacha20StreamEncryptorPush = jest
      .fn()
      .mockReturnValue(new Uint8Array());

    fileService = createService();
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  it('placeholder', async () => {});
});

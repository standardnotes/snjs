import { SNFileService } from './file_service';
import { SNSyncService } from '../sync/sync_service';
import { ItemManager, SNAlertService, SNApiService } from '@Lib/index';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';

describe('fileService', () => {
  let apiService: SNApiService;
  let itemManager: ItemManager;
  let syncService: SNSyncService;
  let alertService: SNAlertService;
  let crypto: SNPureCrypto;

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
  });
});

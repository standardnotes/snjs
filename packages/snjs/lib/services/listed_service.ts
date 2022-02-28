import { lastElement, sleep } from '@standardnotes/utils';
import { UuidString } from '@Lib/types';
import { ContentType } from '@standardnotes/common';
import { ItemManager } from '@Services/item_manager';
import { SNHttpService } from './api/http_service';
import { SNActionsExtension } from './../models/app/extension';
import { SettingName } from '@standardnotes/settings';
import { SNSettingsService } from './settings_service/SNSettingsService';
import { ListedInterface } from './../application_interfaces/listed_interface';
import { SNApiService } from './api/api_service';
import {
  ListedAccount,
  ListedAccountInfo,
  ListedAccountInfoResponse,
} from '@standardnotes/responses';
import { AbstractService } from '@standardnotes/services';

export class ListedService extends AbstractService implements ListedInterface {
  constructor(
    private apiService: SNApiService,
    private itemManager: ItemManager,
    private settingsService: SNSettingsService,
    private httpSerivce: SNHttpService
  ) {
    super();
  }

  public canRegisterNewListedAccount(): boolean {
    return this.apiService.user != undefined;
  }

  /**
   * Account creation is asyncronous on the backend due to message-based nature of architecture.
   * In order to get the newly created account, we poll the server to check for new accounts.
   */
  public async requestNewListedAccount(): Promise<ListedAccount | undefined> {
    const accountsBeforeRequest = await this.getSettingsBasedListedAccounts();
    const response = await this.apiService.registerForListedAccount();
    if (response.error) {
      return undefined;
    }
    const MaxAttempts = 4;
    const DelayBetweenRequests = 3000;
    for (let i = 0; i < MaxAttempts; i++) {
      const accounts = await this.getSettingsBasedListedAccounts();
      if (accounts.length > accountsBeforeRequest.length) {
        return lastElement(accounts);
      } else {
        await sleep(DelayBetweenRequests, false);
      }
    }
    return undefined;
  }

  public async getListedAccounts(): Promise<ListedAccount[]> {
    const settingsBasedAccounts = await this.getSettingsBasedListedAccounts();
    const legacyAccounts = this.getLegacyListedAccounts();

    return [...settingsBasedAccounts, ...legacyAccounts];
  }

  public async getListedAccountInfo(
    account: ListedAccount,
    inContextOfItem?: UuidString
  ): Promise<ListedAccountInfo | undefined> {
    const hostUrl = account.hostUrl;
    let url = `${hostUrl}/authors/${account.authorId}/extension?secret=${account.secret}`;
    if (inContextOfItem) {
      url += `&item_uuid=${inContextOfItem}`;
    }
    const response = (await this.httpSerivce.getAbsolute(
      url
    )) as ListedAccountInfoResponse;
    if (response.error || !response.data) {
      return undefined;
    }

    return response.data;
  }

  private async getSettingsBasedListedAccounts(): Promise<ListedAccount[]> {
    const response = await this.settingsService.getSetting(
      SettingName.ListedAuthorSecrets
    );
    if (!response) {
      return [];
    }
    const accounts = JSON.parse(response) as ListedAccount[];
    return accounts;
  }

  private getLegacyListedAccounts(): ListedAccount[] {
    const extensions = this.itemManager
      .nonErroredItemsForContentType<SNActionsExtension>(
        ContentType.ActionsExtension
      )
      .filter((extension) => extension.isListedExtension);

    const accounts: ListedAccount[] = [];

    for (const extension of extensions) {
      const urlString = extension.url;
      const url = new URL(urlString);

      /** Expected path format: '/authors/647/extension/' */
      const path = url.pathname;
      const authorId = path.split('/')[2];

      /** Expected query string format: '?secret=xxx&type=sn&name=Listed' */
      const queryString = url.search;
      const key = queryString.split('secret=')[1].split('&')[0];

      accounts.push({
        secret: key,
        authorId,
        hostUrl: url.origin,
      });
    }

    return accounts;
  }
}

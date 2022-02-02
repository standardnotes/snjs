import { UuidString } from '@Lib/types';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { FillItemContent } from '@Models/functions';
import { ContentType } from '@standardnotes/common';
import { ItemManager } from '@Services/item_manager';
import { SNHttpService } from './api/http_service';
import { SNActionsExtension } from './../models/app/extension';
import { SettingName } from '@standardnotes/settings';
import { SNSettingsService } from './settings_service/SNSettingsService';
import {
  ListedAccount,
  ListedAccountInfo,
  ListedInterface,
} from './../application_interfaces/listed_interface';
import { SNApiService } from './api/api_service';
import { PureService } from '@Services/pure_service';
import { ListedUrl } from '@Lib/hosts';
import { ListedAccountInfoResponse } from './api/responses';

export function ListedAccountInfoToActionExtension(
  accountInfo: ListedAccountInfo
): SNActionsExtension {
  const payload = CreateMaxPayloadFromAnyObject({
    content_type: ContentType.ActionsExtension,
    uuid: accountInfo.author_url,
    content: FillItemContent({
      ...accountInfo,
      name: accountInfo.display_name,
    }),
  });
  return new SNActionsExtension(payload);
}

export class ListedService extends PureService implements ListedInterface {
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

  public async registerForNewListedAccount(): Promise<unknown> {
    const response = await this.apiService.registerForListedAccount();
    return response;
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
    const hostUrl = account.hostUrl || ListedUrl.Prod;
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
    const accounts = JSON.parse(response).secrets as ListedAccount[];
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

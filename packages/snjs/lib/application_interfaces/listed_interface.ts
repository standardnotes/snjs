import { ListedAccount, ListedAccountInfo } from '@Lib/services/api/responses';
import { UuidString } from '@Lib/types';

export interface ListedInterface {
  canRegisterNewListedAccount: () => boolean;
  requestNewListedAccount: () => Promise<ListedAccount | undefined>;
  getListedAccounts(): Promise<ListedAccount[]>;
  getListedAccountInfo(
    account: ListedAccount,
    inContextOfItem?: UuidString
  ): Promise<ListedAccountInfo | undefined>;
}

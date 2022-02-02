import { ListedAccount, ListedAccountInfo } from '@Lib/services/api/responses';
import { UuidString } from '@Lib/types';

export interface ListedInterface {
  canRegisterNewListedAccount: () => boolean;
  registerForNewListedAccount: () => Promise<unknown>;
  getListedAccounts(): Promise<ListedAccount[]>;
  getListedAccountInfo(
    account: ListedAccount,
    inContextOfItem?: UuidString
  ): Promise<ListedAccountInfo | undefined>;
}

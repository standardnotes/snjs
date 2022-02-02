import { UuidString } from '@Lib/types';

export type ListedAccount = {
  secret: string;
  authorId: string;
  hostUrl?: string;
};

export type ListedAccountInfo = {
  display_name: string;
  author_url: string;
  settings_url: string;
};

export interface ListedInterface {
  canRegisterNewListedAccount: () => boolean;
  registerForNewListedAccount: () => Promise<unknown>;
  getListedAccounts(): Promise<ListedAccount[]>;
  getListedAccountInfo(
    account: ListedAccount,
    inContextOfItem?: UuidString
  ): Promise<ListedAccountInfo | undefined>;
}

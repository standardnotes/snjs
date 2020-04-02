import { AppDataField } from './../models/core/item';
import { DEFAULT_APP_DOMAIN } from './../index';
import { CopyPayload } from '@Payloads/generator';
import { SNItem } from '@Models/core/item';
import { PurePayload } from '@Payloads/pure_payload';
import { Copy } from '@Lib/utils';
import { PayloadContent } from './../protocol/payloads/generator';

export enum MutationType {
  /**
   * The item was changed as part of a user interaction. This means that the item's 
   * user modified date will be updated
   */
  UserInteraction = 1,
  /**
   * The item was changed as part of an internal operation, such as a migration.
   * This change will not updated the item's user modified date
   */
  Internal = 1,
}

const UserModifiedDateKey = 'client_updated_at';

/**
 * An item transformers takes in an item, and an operation, and returns the resulting payload
 */
export class ItemMutator {
  protected readonly item: SNItem
  protected readonly source: MutationType
  protected payload: PurePayload
  protected content?: PayloadContent

  constructor(item: SNItem, source: MutationType) {
    this.item = item;
    this.source = source;
    this.payload = item.payload;
    this.content = Copy(this.payload.content);
  }

  getResult() {
    if (this.source === MutationType.UserInteraction) {
      // Set the user modified date to now if marking the item as dirty
      this.setAppDataItem(UserModifiedDateKey, new Date());
    } else {
      const currentValue = this.item.getAppDomainValue(AppDataField.UserModifiedDate);
      if (!currentValue) {
        // if we don't have an explcit raw value, we initialize client_updated_at.
        this.setAppDataItem(UserModifiedDateKey, new Date(this.item.updated_at!));
      }
    }
    return CopyPayload(
      this.payload,
      {
        content: this.content,
        dirty: true,
        dirtiedDate: new Date(),
      }
    )
  }

  public setDeleted() {
    this.content = undefined;
    this.deleted = true;
  }

  set deleted(deleted: boolean) {
    this.payload = CopyPayload(
      this.payload,
      {
        content: this.content,
        deleted: deleted
      }
    )
  }

  /**
   * Overwrites the entirety of this domain's data with the data arg.
   */
  public setDomainData(data: any, domain: string) {
    if (this.payload.errorDecrypting) {
      return undefined;
    }
    const content = this.content!.appData || {};
    content.appData[domain] || data;
  }

  /**
   * First gets the domain data for the input domain.
   * Then sets data[key] = value
   */
  public setDomainDataKey(key: string, value: any, domain: string) {
    if (this.payload.errorDecrypting) {
      return undefined;
    }
    const content = this.content!.appData || {};
    const data = content.appData[domain] || {};
    data[key] = value;
    content.appData[domain] = data;
  }

  public setAppDataItem(key: string, value: any) {
    this.setDomainData(key, value, DEFAULT_APP_DOMAIN);
  }

  public addItemAsRelationship(item: SNItem) {
    const references = this.content!.references || [];
    if (!references.find((r) => r.uuid === item.uuid)) {
      references.push({
        uuid: item.uuid!,
        content_type: item.content_type!
      });
    }
    this.content!.references = references;
  }

  public removeItemAsRelationship(item: SNItem) {
    let references = this.content!.references || [];
    references = references.filter((r) => r.uuid !== item.uuid);
    this.content!.references = references;
  }
}
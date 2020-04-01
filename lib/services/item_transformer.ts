import { CopyPayload } from '@Payloads/generator';
import { SNItem } from '@Models/core/item';
import { PurePayload } from '@Payloads/pure_payload';
import { Copy } from '@Lib/utils';
import { PayloadOverride, PayloadContent } from './../protocol/payloads/generator';

/**
 * An item transformers takes in an item, and an operation, and returns the resulting payload
 */
export class ItemTransformer {
  protected readonly item: SNItem
  protected payload: PurePayload
  protected content: PayloadContent

  constructor(item: SNItem) {
    this.item = item;
    this.payload = item.payload;
    this.content = Copy(this.payload.content);
  }

  getResult() {
    return CopyPayload(
      this.payload,
      {
        content: this.content
      }
    )
  }

  private setDomainData(key: string, value: any, domain: string) {
    if (this.payload.errorDecrypting) {
      return undefined;
    }
    const content = this.content.appData || {};
    const data = content.appData[domain] || {};
    data[key] = value;
    content.appData[domain] = data;
  }

  public setAppDataItem(key: string, value: any) {
    this.setDomainData(key, value, DEFAULT_APP_DOMAIN);
  }

  public addItemAsRelationship(item: SNItem) {
    const references = this.content.references || [];
    if (!references.find((r) => r.uuid === item.uuid)) {
      references.push({
        uuid: item.uuid,
        content_type: item.content_type
      });
    }
    this.content.references = references;
  }

  public removeItemAsRelationship(item: SNItem) {
    let references = this.content.references || [];
    references = references.filter((r) => r.uuid !== item.uuid);
    this.content.references = references;
  }

  /**
   * 
   * @param userModified Whether this is a user initiated change.
   */
  public setDirty(
    dirty: boolean,
    userModified: boolean
  ) {
    if (dirty && userModified) {
      // Set the client modified date to now if marking the item as dirty
      this.setAppDataItem('client_updated_at', new Date());
    } else {
      const currentValue = this.item.getAppDataItem('client_updated_at');
      if(!currentValue) {
        // if we don't have an explcit raw value, we initialize client_updated_at.
        this.setAppDataItem('client_updated_at', new Date(this.item.updated_at!));
      }
    }
    const content = this.content;
    this.payload = CopyPayload(
      this.payload,
      {
        content: this.content,
        dirty: dirty,
        dirtiedDate: new Date(),
      }
    )

  }
}
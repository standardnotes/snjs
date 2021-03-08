import { ContentType } from '@Models/content_types';
import { SNApplication } from './../application';
import { SNItem } from '@Models/core/item';

/** Keeps an item reference up to date with changes */
export class LiveItem<T extends SNItem> {
  public item: T;
  private removeObserver: any;

  constructor(
    uuid: string,
    application: SNApplication,
    onChange?: (item: T) => void
  ) {
    this.item = application.findItem(uuid)! as T;
    onChange && onChange(this.item);
    this.removeObserver = application.streamItems(
      this.item.content_type,
      async (items) => {
        const matchingItem = items.find((item) => {
          return item.uuid === uuid;
        });
        if (matchingItem) {
          this.item = matchingItem as T;
          onChange && onChange(this.item);
        }
      }
    );
  }

  public deinit() {
    this.removeObserver();
    this.removeObserver = undefined;
  }
}

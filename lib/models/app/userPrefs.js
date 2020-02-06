import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { SFPredicate } from '@Models/core/predicate';

export class SNUserPrefs extends SFItem {

  static contentType() {
    return ContentTypes.UserPrefs;
  }

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SFPredicate('content_type', '=', this.content_type);
  }
}

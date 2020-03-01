import { SNItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { SNPredicate } from '@Models/core/predicate';

export class SNUserPrefs extends SNItem {

  static contentType() {
    return ContentTypes.UserPrefs;
  }

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SNPredicate('content_type', '=', this.content_type);
  }
}

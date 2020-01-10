import { SFItem } from '@Models/core/item';
import { CONTENT_TYPE_USER_PREFS } from '@Models/content_types';

export class SNUserPrefs extends SFItem {

  static contentType() {
    return CONTENT_TYPE_USER_PREFS;
  }

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SFPredicate('content_type', '=', this.content_type);
  }
}

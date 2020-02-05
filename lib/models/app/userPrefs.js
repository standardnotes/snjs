import { ContentTypes, SFItem, SFPredicate } from '@Models';

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

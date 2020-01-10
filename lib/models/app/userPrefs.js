import { SFItem } from '@Models/core/item';
export class SNUserPrefs extends SFItem {

  static contentType() {
    return 'SN|UserPreferences';
  }

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SFPredicate('content_type', '=', this.content_type);
  }
}

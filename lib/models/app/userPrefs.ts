import { SNItem } from '@Models/core/item';
import { ContentType } from '@Models/content_types';
import { SNPredicate } from '@Models/core/predicate';

export class SNUserPrefs extends SNItem {

  get isSingleton() {
    return true;
  }

  get singletonPredicate() {
    return new SNPredicate('content_type', '=', this.content_type!);
  }
}

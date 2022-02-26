import { PredicateInterface, predicateFromJson } from '@standardnotes/payloads';
import { SNItem } from '@Models/core/item';
import { PurePayload } from '@standardnotes/payloads';

export const SMART_TAG_DSL_PREFIX = '![';

export enum SystemViewId {
  AllNotes = 'all-notes',
  ArchivedNotes = 'archived-notes',
  TrashedNotes = 'trashed-notes',
}

export interface SmartViewContent {
  title: string;
  predicate: PredicateInterface<SNItem>;
}

/**
 * A tag that defines a predicate that consumers can use
 * to retrieve a dynamic list of items.
 */
export class SmartView extends SNItem implements SmartViewContent {
  public readonly predicate: PredicateInterface<SNItem>;
  public readonly title: string;

  constructor(payload: PurePayload) {
    super(payload);
    this.predicate = predicateFromJson(payload.safeContent.predicate);
    this.title = String(payload.safeContent.title || '');
  }
}

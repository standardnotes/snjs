import {
  predicateFromJson,
  PredicateInterface,
  PredicateJsonForm,
} from '@standardnotes/payloads';
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
  predicate: PredicateJsonForm;
}

/**
 * A tag that defines a predicate that consumers can use
 * to retrieve a dynamic list of items.
 */
export class SmartView extends SNItem {
  public readonly predicate: PredicateInterface<SNItem>;
  public readonly title: string;

  constructor(payload: PurePayload) {
    super(payload);
    this.predicate =
      payload.safeContent.predicatewValue &&
      predicateFromJson(payload.safeContent.predicatewValue);
    this.title = String(payload.safeContent.title || '');
  }
}

import { ContentType } from '@Lib/index';
import { SNNote, SNTag } from '../../models';
import { SNSmartTag } from './../../models/app/smartTag';
import { ItemDelta, SNIndex, ItemCollection } from '@standardnotes/payloads';
import {
  criteriaForSmartTag,
  NotesDisplayCriteria,
  notesMatchingCriteria,
} from './notes_display_criteria';

/**
 * A view into ItemCollection that allows filtering by tag and smart tag.
 */
export class ItemCollectionNotesView implements SNIndex {
  private displayedNotes: SNNote[] = [];
  private needsRebuilding = true;

  constructor(
    private collection: ItemCollection,
    private criteria: NotesDisplayCriteria = NotesDisplayCriteria.Create({})
  ) {}

  public setCriteria(criteria: NotesDisplayCriteria): void {
    this.criteria = criteria;
    this.collection.setDisplayOptions(
      ContentType.Note,
      criteria.sortProperty,
      criteria.sortDirection
    );
    this.needsRebuilding = true;
  }

  public notesMatchingSmartTag(smartTag: SNSmartTag): SNNote[] {
    const criteria = criteriaForSmartTag(smartTag);
    return notesMatchingCriteria(criteria, this.collection);
  }

  public displayElements(): SNNote[] {
    if (this.needsRebuilding) {
      this.rebuildList();
    }
    return this.displayedNotes.slice();
  }

  private rebuildList(): void {
    this.displayedNotes = notesMatchingCriteria(
      this.currentCriteria,
      this.collection
    );
    this.needsRebuilding = false;
  }

  private get currentCriteria(): NotesDisplayCriteria {
    const mostRecentVersionOfTags = this.criteria.tags
      .map((tag) => {
        if (tag.isSystemSmartTag) {
          return tag;
        } else {
          return this.collection.find(tag.uuid) as SNTag;
        }
      })
      .filter((tag) => tag != undefined);

    const criteria = NotesDisplayCriteria.Copy(this.criteria, {
      tags: mostRecentVersionOfTags,
    });

    return criteria;
  }

  public onChange(_delta: ItemDelta): void {
    this.needsRebuilding = true;
  }
}

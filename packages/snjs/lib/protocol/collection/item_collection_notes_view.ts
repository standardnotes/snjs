import { SNSmartTag } from './../../models/app/smartTag';
import { ItemCollection } from './item_collection';
import { ContentType, SNNote, SNTag } from '../../models';
import {
  criteriaForSmartTag,
  NotesDisplayCriteria,
  notesMatchingCriteria,
} from './notes_display_criteria';

/**
 * A view into ItemCollection that allows filtering by tag and smart tag.
 */
export class ItemCollectionNotesView {
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

  public forTag(tag: SNTag): ItemCollectionNotesView {
    const criteria = this.criteria.copy({tags: [tag]});
    return new ItemCollectionNotesView(this.collection, criteria);
  }

  public notesMatchingSmartTag(smartTag: SNSmartTag) {
    const criteria = criteriaForSmartTag(smartTag);
    return notesMatchingCriteria(criteria, this.collection);
  }

  private rebuildList(): void {
    const criteria = NotesDisplayCriteria.Copy(this.criteria, {
      /** Get the most recent version of the tags */
      tags: this.criteria.tags.map((tag) => {
        if (tag.isSystemSmartTag) {
          return tag;
        } else {
          return this.collection.find(tag.uuid) as SNTag;
        }
      }),
    });
    this.displayedNotes = notesMatchingCriteria(criteria, this.collection);
  }

  setNeedsRebuilding() {
    this.needsRebuilding = true;
  }

  displayElements() {
    if (this.needsRebuilding) {
      this.rebuildList();
      this.needsRebuilding = false;
    }
    return this.displayedNotes.slice();
  }
}

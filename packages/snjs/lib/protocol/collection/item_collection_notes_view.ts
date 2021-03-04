import { SNSmartTag } from './../../models/app/smartTag';
import { ItemCollection } from './item_collection';
import { Uuids } from '@Lib/models/functions';
import {
  ContentType,
  SNNote,
  SNTag,
} from '../../models';
import { criteriaForSmartTag, NotesDisplayCriteria, notesMatchingCriteria } from './notes_display_criteria';

/**
 * A view into ItemCollection that allows filtering by tag and smart tag.
 */
export class ItemCollectionNotesView {
  private displayedNotes: SNNote[] = [];
  private needsRebuilding = true;
  private criteria!: NotesDisplayCriteria;

  constructor(
    private collection: ItemCollection
  ) {}

  public setCriteria(criteria: NotesDisplayCriteria): void {
    this.criteria = criteria;
    this.collection.setDisplayOptions(
      ContentType.Note,
      criteria.sortProperty,
      criteria.sortDirection,
    );
    this.needsRebuilding = true;
  }

  public notesMatchingSmartTag(smartTag: SNSmartTag) {
    const criteria = criteriaForSmartTag(smartTag);
    return notesMatchingCriteria(criteria, this.collection);
  }

  private rebuildList(): void {
    const criteria = NotesDisplayCriteria.Copy(this.criteria, (criteria) => {
      /** Get the most recent version of the tags */
      if (criteria.tags) {
        const refreshedTags: SNTag[] = [];
        for(const tag of criteria.tags) {
          if(tag.isSystemSmartTag) {
            refreshedTags.push(tag);
          } else {
            refreshedTags.push(this.collection.find(tag.uuid) as SNTag)
          }
        }
        criteria.tags = refreshedTags;
      }
    })
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

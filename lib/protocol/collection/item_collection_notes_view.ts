import { SNNote, SNTag, SNSmartTag, SNPredicate, SNItem, ContentType } from '../../models'
import { ItemCollection, CollectionSort, SortDirection } from "./item_collection";

/**
 * A view into ItemCollection that allows filtering by tag and smart tag.
 */
export class ItemCollectionNotesView {
  private displayedList: SNNote[] = [];
  private tag?: SNTag;
  private needsRebuilding = true;

  constructor(private collection: ItemCollection) {
  }

  public notesMatchingSmartTag(smartTag: SNSmartTag, notes: SNNote[]): SNNote[] {
    const predicate = smartTag.predicate;

    /** Optimized special cases */
    if (smartTag.isArchiveTag) {
      return notes.filter(note => note.archived && !note.trashed && !note.deleted);
    } else if (smartTag.isTrashTag) {
      return notes.filter(note => note.trashed && !note.deleted);
    }
    const allNotes: SNNote[] = notes.filter(
      note => !note.trashed && !note.deleted
    );
    if (smartTag.isAllTag) {
      return allNotes as SNNote[];
    }

    if (predicate.keypathIncludesVerb('tags')) {
      /**
       * A note object doesn't come with its tags, so we map the list to
       * flattened note-like objects that also contain
       * their tags. Having the payload properties on the same level as the note
       * properties is necessary because SNNote has many getters that are
       * proxies to its inner payload object.
       */
      return allNotes.map(note => ({
        ...note,
        ...note.payload,
        tags: this.collection.elementsReferencingElement(note),
      }))
      .filter(note => SNPredicate.ObjectSatisfiesPredicate(note, predicate))
      /** Map our special-case items back to notes */
      .map(note => this.collection.map[note.uuid] as SNNote);
    } else {
      return allNotes
        .filter(note => SNPredicate.ObjectSatisfiesPredicate(note, predicate));
    }
  }


  public setDisplayOptions(
    tag?: SNTag,
    sortBy?: CollectionSort,
    direction?: SortDirection,
    filter?: (element: SNItem) => boolean
  ) {
    this.collection.setDisplayOptions(
      ContentType.Note,
      sortBy,
      direction,
      filter
    );
    this.tag = tag;
    this.needsRebuilding = true;
  }

  private rebuildList() {
    const tag = this.tag;
    const notes = this.collection.displayElements(ContentType.Note) as SNNote[];
    if (tag?.isSmartTag()) {
      this.displayedList = this.notesMatchingSmartTag(
        tag as SNSmartTag,
        notes
      );
    } else if (tag) {
      this.displayedList = this.collection.elementsReferencingElement(tag)
        .filter(element =>
          element.content_type === ContentType.Note &&
          !element.deleted &&
          !element.trashed
      ) as SNNote[];
    } else {
      this.displayedList = notes;
    }
  }

  setNeedsRebuilding() {
    this.needsRebuilding = true;
  }

  displayElements() {
    if (this.needsRebuilding) {
      this.rebuildList();
      this.needsRebuilding = false;
    }
    return this.displayedList.slice();
  }

  all() {
    return this.collection.all(ContentType.Note) as SNNote[];
  }
}

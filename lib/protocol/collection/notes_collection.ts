import { SNNote, SNTag, SNSmartTag, SNPredicate, SNItem, ContentType } from '../../models'
import { ItemCollection, CollectionSort, SortDirection } from "./item_collection";
import { UuidString } from "@Lib/types";

export class NotesCollection {
  private displayedList: SNNote[] = [];
  private tag?: SNTag;
  needsRebuilding = true;

  constructor(private collection: ItemCollection) {
  }

  private tags() {
    return (this.collection.typedMap[ContentType.Tag] || []) as SNTag[];
  }

  public notesMatchingSmartTag(smartTag: SNSmartTag, notes: SNNote[]): SNNote[] {
    let predicate = smartTag.predicate;

    /** Optimized special cases */
    if (smartTag.isArchiveTag) {
      return notes.filter(note => note.archived && !note.trashed && !note.deleted);
    } else if (smartTag.isTrashTag) {
      return notes.filter(note => note.trashed && !note.deleted);
    }
    let matchingNotes: Pick<SNNote, 'uuid'>[] = notes.filter(
      note => !note.trashed && !note.deleted
    );
    if (smartTag.isAllTag) {
      return matchingNotes as SNNote[];
    }

    if (predicate.keypathIncludesVerb('tags')) {
      /** Populate notes with their tags */
      const tags = this.tags();
      matchingNotes = notes.map(note => ({
        ...note,
        ...note.payload,
        tags: tags.filter(tag => tag.hasRelationshipWithItem(note))
      }));
    }

    return matchingNotes
      .filter(note => SNPredicate.ObjectSatisfiesPredicate(note, predicate))
      .map(note => this.collection.map[note.uuid] as SNNote);
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
      this.displayedList = notes.filter(note =>
        !note.deleted && !note.trashed &&
        tag.hasRelationshipWithItem(note)
      )
    } else {
      this.displayedList = notes;
    }
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

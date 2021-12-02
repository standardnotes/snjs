import { SortDirection } from './item_collection';
import { CollectionSort } from '@Lib/protocol/collection/item_collection';
import { SNTag } from './../../models/app/tag';
import { SNPredicate } from './../../models/core/predicate';
import { ContentType } from './../../models/content_types';
import { ItemCollection } from './item_collection';
import { SNNote } from './../../models/app/note';
import { SNSmartTag } from './../../models/app/smartTag';

export type SearchQuery = {
  query: string;
  includeProtectedNoteText: boolean;
};

export class NotesDisplayCriteria {
  public searchQuery?: SearchQuery;
  public tags: SNTag[] = [];
  public includePinned = true;
  public includeProtected = true;
  public includeTrashed = false;
  public includeArchived = false;
  public sortProperty?: CollectionSort;
  public sortDirection?: SortDirection;

  static Create(
    properties: Partial<NotesDisplayCriteria>
  ): NotesDisplayCriteria {
    const criteria = new NotesDisplayCriteria();
    Object.assign(criteria, properties);
    return Object.freeze(criteria);
  }

  static Copy(
    criteria: NotesDisplayCriteria,
    override: Partial<NotesDisplayCriteria>
  ): NotesDisplayCriteria {
    const copy = new NotesDisplayCriteria();
    Object.assign(copy, criteria);
    Object.assign(copy, override);
    return Object.freeze(copy);
  }

  computeFilters(collection: ItemCollection): NoteFilter[] {
    const nonSmartTags = this.tags.filter((tag) => !tag.isSmartTag);
    const allSmartTags = this.tags.filter((tag) => tag.isSmartTag) as [
      SNSmartTag
    ];
    const systemSmartTags = allSmartTags.filter((t) => t.isSystemSmartTag);
    const userSmartTags = allSmartTags.filter((t) => !t.isSystemSmartTag);

    let usesArchiveSmartTag = false;
    let usesTrashSmartTag = false;

    const filters: NoteFilter[] = [];
    for (const systemTag of systemSmartTags) {
      if (systemTag.isArchiveTag) {
        filters.push((note) => note.archived && !note.deleted);
        usesArchiveSmartTag = true;
      } else if (systemTag.isTrashTag) {
        filters.push((note) => note.trashed && !note.deleted);
        usesTrashSmartTag = true;
      }
    }
    if (userSmartTags.length > 0) {
      const predicate = SNPredicate.CompoundPredicate(
        userSmartTags.map((t) => t.predicate)
      );
      filters.push((note) => {
        if (predicate.keypathIncludesVerb('tags')) {
          /**
           * A note object doesn't come with its tags, so we map the list to
           * flattened note-like objects that also contain
           * their tags. Having the payload properties on the same level as the note
           * properties is necessary because SNNote has many getters that are
           * proxies to its inner payload object.
           */
          const noteWithTags = {
            ...note,
            ...note.payload,
            tags: collection.elementsReferencingElement(note, ContentType.Tag),
          };
          return SNPredicate.ObjectSatisfiesPredicate(noteWithTags, predicate);
        } else {
          return SNPredicate.ObjectSatisfiesPredicate(note, predicate);
        }
      });
    } else if (nonSmartTags.length > 0) {
      for (const tag of nonSmartTags) {
        filters.push((note) => tag.hasRelationshipWithItem(note));
      }
    }
    if (this.searchQuery) {
      filters.push((note) =>
        noteMatchesQuery(note, this.searchQuery!, collection)
      );
    }
    if (!this.includePinned) {
      filters.push((note) => !note.pinned);
    }
    if (!this.includeProtected) {
      filters.push((note) => !note.protected);
    }
    if (!this.includeTrashed && !usesTrashSmartTag) {
      filters.push((note) => !note.trashed);
    }
    /**
     * Archived notes should still appear in trash by default,
     * but trashed notes don't appear in Archived
     */
    if (!this.includeArchived && !usesArchiveSmartTag && !usesTrashSmartTag) {
      filters.push((note) => !note.archived);
    }

    return filters;
  }
}

type NoteFilter = (note: SNNote) => boolean;

export function criteriaForSmartTag(tag: SNSmartTag): NotesDisplayCriteria {
  const criteria = NotesDisplayCriteria.Create({
    tags: [tag],
  });
  return criteria;
}

export function notesMatchingCriteria(
  criteria: NotesDisplayCriteria,
  collection: ItemCollection
): SNNote[] {
  const filters = criteria.computeFilters(collection);
  const allNotes = collection.displayElements(ContentType.Note) as SNNote[];
  return allNotes.filter((note) => {
    return notePassesFilters(note, filters);
  });
}

function notePassesFilters(note: SNNote, filters: NoteFilter[]) {
  for (const filter of filters) {
    if (!filter(note)) {
      return false;
    }
  }
  return true;
}

export function noteMatchesQuery(
  noteToMatch: SNNote,
  searchQuery: SearchQuery,
  noteCollection: ItemCollection
): boolean {
  const noteTags = noteCollection.elementsReferencingElement(
    noteToMatch,
    ContentType.Tag
  ) as SNTag[];
  const someTagsMatches = noteTags.some(
    (tag) =>
      matchTypeForTagAndStringQuery(tag, searchQuery.query) !== Match.None
  );

  if (noteToMatch.protected && !searchQuery.includeProtectedNoteText) {
    const match = matchTypeForNoteAndStringQuery(
      noteToMatch,
      searchQuery.query
    );
    /** Only true if there is a match in the titles (note and/or tags) */
    return (
      match === Match.Title || match === Match.TitleAndText || someTagsMatches
    );
  }
  return (
    matchTypeForNoteAndStringQuery(noteToMatch, searchQuery.query) !==
      Match.None || someTagsMatches
  );
}

enum Match {
  None = 0,
  Title = 1,
  Text = 2,
  TitleAndText = Title + Text,
  Uuid = 5,
}

function matchTypeForNoteAndStringQuery(
  note: SNNote,
  searchString: string
): Match {
  if (searchString.length === 0) {
    return Match.TitleAndText;
  }
  const title = note.safeTitle().toLowerCase();
  const text = note.safeText().toLowerCase();
  const lowercaseText = searchString.toLowerCase();
  const words = lowercaseText.split(' ');
  const quotedText = stringBetweenQuotes(lowercaseText);
  if (quotedText) {
    return (
      (title.includes(quotedText) ? Match.Title : Match.None) +
      (text.includes(quotedText) ? Match.Text : Match.None)
    );
  }
  if (stringIsUuid(lowercaseText)) {
    return note.uuid === lowercaseText ? Match.Uuid : Match.None;
  }
  const matchesTitle = words.every((word) => {
    return title.indexOf(word) >= 0;
  });
  const matchesBody = words.every((word) => {
    return text.indexOf(word) >= 0;
  });
  return (matchesTitle ? Match.Title : 0) + (matchesBody ? Match.Text : 0);
}

function matchTypeForTagAndStringQuery(
  tag: SNTag,
  searchString: string
): Match {
  if (searchString.length === 0) {
    return Match.None;
  }
  const title = tag.title.toLowerCase();
  const lowercaseText = searchString.toLowerCase();
  const words = lowercaseText.split(' ');
  const quotedText = stringBetweenQuotes(lowercaseText);
  if (quotedText) {
    return title.includes(quotedText) ? Match.Title : Match.None;
  }
  const matchesTitle = words.every((word) => {
    return title.indexOf(word) >= 0;
  });
  return matchesTitle ? Match.Title : Match.None;
}

function stringBetweenQuotes(text: string) {
  const matches = text.match(/"(.*?)"/);
  return matches ? matches[1] : null;
}

function stringIsUuid(text: string) {
  const matches = text.match(
    /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/
  );
  // eslint-disable-next-line no-unneeded-ternary
  return matches ? true : false;
}

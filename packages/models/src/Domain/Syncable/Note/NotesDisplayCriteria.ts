import {
  CollectionSortDirection,
  CollectionSortProperty,
} from './../../Runtime/Collection/CollectionSort'
import { ContentType } from '@standardnotes/common'
import { NoteWithTags } from './NoteWithTags'
import { DecryptedItem } from '../../Abstract/Item'
import { SNTag } from '../Tag'
import { SNNote } from '.'
import { SmartView } from '../SmartView'
import { ItemCollection } from '../../Runtime/Collection/Item/ItemCollection'
import { CompoundPredicate } from '../../Runtime/Predicate/CompoundPredicate'

export type SearchQuery = {
  query: string
  includeProtectedNoteText: boolean
}

export class NotesDisplayCriteria {
  public searchQuery?: SearchQuery
  public tags: SNTag[] = []
  public views: SmartView[] = []
  public includePinned?: boolean
  public includeProtected?: boolean
  public includeTrashed?: boolean
  public includeArchived?: boolean
  public sortProperty?: CollectionSortProperty
  public sortDirection?: CollectionSortDirection

  static Create(properties: Partial<NotesDisplayCriteria>): NotesDisplayCriteria {
    const criteria = new NotesDisplayCriteria()
    Object.assign(criteria, properties)
    return Object.freeze(criteria)
  }

  static Copy(
    criteria: NotesDisplayCriteria,
    override: Partial<NotesDisplayCriteria>,
  ): NotesDisplayCriteria {
    const copy = new NotesDisplayCriteria()
    Object.assign(copy, criteria)
    Object.assign(copy, override)
    return Object.freeze(copy)
  }

  computeFilters(collection: ItemCollection): NoteFilter[] {
    const filters: NoteFilter[] = []

    let viewsPredicate: CompoundPredicate<DecryptedItem> | undefined = undefined
    if (this.views.length > 0) {
      const compoundPredicate = new CompoundPredicate(
        'and',
        this.views.map((t) => t.predicate),
      )
      viewsPredicate = compoundPredicate

      filters.push((note) => {
        if (compoundPredicate.keypathIncludesString('tags')) {
          const noteWithTags = NoteWithTags.Create(
            note.payload,
            collection.elementsReferencingElement(note, ContentType.Tag) as SNTag[],
          )
          return compoundPredicate.matchesItem(noteWithTags)
        } else {
          return compoundPredicate.matchesItem(note)
        }
      })
    }

    if (this.tags.length > 0) {
      for (const tag of this.tags) {
        filters.push((note) => tag.hasRelationshipWithItem(note))
      }
    }

    if (this.includePinned === false && !viewsPredicate?.keypathIncludesString('pinned')) {
      filters.push((note) => !note.pinned)
    }

    if (this.includeProtected === false && !viewsPredicate?.keypathIncludesString('protected')) {
      filters.push((note) => !note.protected)
    }

    if (this.includeTrashed === false && !viewsPredicate?.keypathIncludesString('trashed')) {
      filters.push((note) => !note.trashed)
    }

    if (this.includeArchived === false && !viewsPredicate?.keypathIncludesString('archived')) {
      filters.push((note) => !note.archived)
    }

    if (this.searchQuery) {
      const query = this.searchQuery
      filters.push((note) => noteMatchesQuery(note, query, collection))
    }

    return filters
  }
}

type NoteFilter = (note: SNNote) => boolean

export function criteriaForSmartView(view: SmartView): NotesDisplayCriteria {
  const criteria = NotesDisplayCriteria.Create({
    views: [view],
  })
  return criteria
}

export function notesMatchingCriteria(
  criteria: NotesDisplayCriteria,
  collection: ItemCollection,
): SNNote[] {
  const filters = criteria.computeFilters(collection)
  const allNotes = collection.displayElements(ContentType.Note) as SNNote[]
  return allNotes.filter((note) => {
    return notePassesFilters(note, filters)
  })
}

function notePassesFilters(note: SNNote, filters: NoteFilter[]) {
  for (const filter of filters) {
    if (!filter(note)) {
      return false
    }
  }
  return true
}

export function noteMatchesQuery(
  noteToMatch: SNNote,
  searchQuery: SearchQuery,
  noteCollection: ItemCollection,
): boolean {
  const noteTags = noteCollection.elementsReferencingElement(
    noteToMatch,
    ContentType.Tag,
  ) as SNTag[]
  const someTagsMatches = noteTags.some(
    (tag) => matchTypeForTagAndStringQuery(tag, searchQuery.query) !== Match.None,
  )

  if (noteToMatch.protected && !searchQuery.includeProtectedNoteText) {
    const match = matchTypeForNoteAndStringQuery(noteToMatch, searchQuery.query)
    /** Only true if there is a match in the titles (note and/or tags) */
    return match === Match.Title || match === Match.TitleAndText || someTagsMatches
  }
  return (
    matchTypeForNoteAndStringQuery(noteToMatch, searchQuery.query) !== Match.None || someTagsMatches
  )
}

enum Match {
  None = 0,
  Title = 1,
  Text = 2,
  TitleAndText = Title + Text,
  Uuid = 5,
}

function matchTypeForNoteAndStringQuery(note: SNNote, searchString: string): Match {
  if (searchString.length === 0) {
    return Match.TitleAndText
  }
  const title = note.title.toLowerCase()
  const text = note.text.toLowerCase()
  const lowercaseText = searchString.toLowerCase()
  const words = lowercaseText.split(' ')
  const quotedText = stringBetweenQuotes(lowercaseText)
  if (quotedText) {
    return (
      (title.includes(quotedText) ? Match.Title : Match.None) +
      (text.includes(quotedText) ? Match.Text : Match.None)
    )
  }
  if (stringIsUuid(lowercaseText)) {
    return note.uuid === lowercaseText ? Match.Uuid : Match.None
  }
  const matchesTitle = words.every((word) => {
    return title.indexOf(word) >= 0
  })
  const matchesBody = words.every((word) => {
    return text.indexOf(word) >= 0
  })
  return (matchesTitle ? Match.Title : 0) + (matchesBody ? Match.Text : 0)
}

function matchTypeForTagAndStringQuery(tag: SNTag, searchString: string): Match {
  if (!tag.title || searchString.length === 0) {
    return Match.None
  }
  const title = tag.title.toLowerCase()
  const lowercaseText = searchString.toLowerCase()
  const words = lowercaseText.split(' ')
  const quotedText = stringBetweenQuotes(lowercaseText)
  if (quotedText) {
    return title.includes(quotedText) ? Match.Title : Match.None
  }
  const matchesTitle = words.every((word) => {
    return title.indexOf(word) >= 0
  })
  return matchesTitle ? Match.Title : Match.None
}

function stringBetweenQuotes(text: string) {
  const matches = text.match(/"(.*?)"/)
  return matches ? matches[1] : null
}

function stringIsUuid(text: string) {
  const matches = text.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/)
  // eslint-disable-next-line no-unneeded-ternary
  return matches ? true : false
}

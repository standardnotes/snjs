import { DecryptedPayload } from './../../Abstract/Payload/Implementations/DecryptedPayload'
import { SNNote } from '../Note/Note'
import { SmartViewContent } from './SmartView'
import { NoteWithTags } from '../Note/NoteWithTags'
import { ContentType } from '@standardnotes/common'
import { NotesDisplayCriteria } from '../Note/NotesDisplayCriteria'
import { SmartView, SystemViewId } from '.'
import { FillItemContent } from '../../Abstract/Item/Interfaces/ItemContent'
import { Predicate } from '../../Runtime/Predicate/Predicate'
import { CompoundPredicate } from '../../Runtime/Predicate/CompoundPredicate'

export function BuildSmartViews(criteria: NotesDisplayCriteria): SmartView[] {
  const notes = new SmartView(
    new DecryptedPayload({
      uuid: SystemViewId.AllNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent<SmartViewContent>({
        title: 'Notes',
        predicate: allNotesPredicate(criteria).toJson(),
      }),
    }),
  )

  const archived = new SmartView(
    new DecryptedPayload({
      uuid: SystemViewId.ArchivedNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent<SmartViewContent>({
        title: 'Archived',
        predicate: archivedNotesPredicate(criteria).toJson(),
      }),
    }),
  )

  const trash = new SmartView(
    new DecryptedPayload({
      uuid: SystemViewId.TrashedNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent<SmartViewContent>({
        title: 'Trash',
        predicate: trashedNotesPredicate(criteria).toJson(),
      }),
    }),
  )

  const untagged = new SmartView(
    new DecryptedPayload({
      uuid: SystemViewId.UntaggedNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent<SmartViewContent>({
        title: 'Untagged',
        predicate: untaggedNotesPredicate(criteria).toJson(),
      }),
    }),
  )

  return [notes, archived, trash, untagged]
}

function allNotesPredicate(criteria: NotesDisplayCriteria) {
  const subPredicates: Predicate<SNNote>[] = [new Predicate('content_type', '=', ContentType.Note)]

  if (criteria.includeTrashed === false) {
    subPredicates.push(new Predicate('trashed', '=', false))
  }
  if (criteria.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (criteria.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (criteria.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function archivedNotesPredicate(criteria: NotesDisplayCriteria) {
  const subPredicates: Predicate<SNNote>[] = [
    new Predicate('archived', '=', true),
    new Predicate('content_type', '=', ContentType.Note),
  ]
  if (criteria.includeTrashed === false) {
    subPredicates.push(new Predicate('trashed', '=', false))
  }
  if (criteria.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (criteria.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function trashedNotesPredicate(criteria: NotesDisplayCriteria) {
  const subPredicates: Predicate<SNNote>[] = [
    new Predicate('trashed', '=', true),
    new Predicate('content_type', '=', ContentType.Note),
  ]
  if (criteria.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (criteria.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (criteria.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function untaggedNotesPredicate(criteria: NotesDisplayCriteria) {
  const subPredicates = [
    new Predicate('content_type', '=', ContentType.Note),
    new Predicate<NoteWithTags>('tagsCount', '=', 0),
  ]
  if (criteria.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (criteria.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (criteria.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}
